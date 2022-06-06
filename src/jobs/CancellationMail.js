import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../mail';

class CancellationMail {
  // esse key é como se fosse uma variavel de acesso rapido
  get key() {
    return 'CancellationMail'; // para cada job eu crio uma chave única
  }

  /* esse metodo handle será a tarefa individual executada quando
  esse método for chamado. Sera um envio para cada email.
  se for 10 e-mails serao 10 handles desse, sao 10 tarefas
  */

  async handle({ data }) {
    const { appointment } = data;

    // enviar o email
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`, // formato oficial
      subject: '[AVISO] Agendamento cancelado',
      template: 'cancellation', // nome do template de email hbs que vou usar
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', ás' H:mm 'hs.'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new CancellationMail();
