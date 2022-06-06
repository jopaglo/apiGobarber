import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, subHours, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../config/queue';

class AppointmentController {
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'O formulário enviado não atende as regras!' });
    }

    const { provider_id, date } = req.body;

    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      return res.status(401).json({
        error: 'O prestador selecionado não existe e/ou não é um prestador!',
      });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'O horário que você selecionou é antigo, já passou!' });
    }

    const checkDateAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkDateAvailability) {
      return res.status(400).json({
        error:
          'Já existe um agendamento para esse horário, por favor selecione outro horário!',
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart, // para garantir que nao tenha horário quebrado
    });

    // enviar uma notificacao para o prestador do novo agendamento
    const user = await User.findByPk(req.userId);

    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm 'hs.'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    // ele é um usuário mesmo para ver seus agendamentos?
    const checkIsUser = await User.findOne({
      where: { id: req.userId, provider: false },
    });

    if (!checkIsUser) {
      return res.status(400).json({
        error: 'Apenas usuários logados podem visualizar os seus agendamentos!',
      });
    }

    // listar todos os agendamentos do usuário
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },

      order: ['date'], // para classificar a consulta
      attributes: ['id', 'date', 'past', 'cancelable', 'canceled_at'], // quais colunas quero exibir
      limit: 5, // maximo de registros que vou listar por vez
      offset: (page - 1) * 5, // quantos registros vou pular por pagina

      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    /* esse ID de agendamento existe na base pelo menos? */
    if (!appointment) {
      return res.status(400).json({
        error:
          'O agendamento que você deseja cancelar não existe ou já foi cancelado!',
      });
    }

    /* confirmando se o usuário é realmente o dono desse agendamento */
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error:
          'Você não tem permissão para cancelar agendamento de outros usuários!',
      });
    }

    /* confirmando se o cancelamento está dentro do range de horário
    eu um projeto original o prestador vai marcar com quanto tempo aceita */
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error:
          'Os cancelamentos só podem ser feitos com 2 horas de antecedencia!',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, { appointment });

    return res.json(appointment);
  }
}

export default new AppointmentController();
