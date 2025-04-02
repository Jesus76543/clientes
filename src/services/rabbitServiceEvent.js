import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const RABBITMQ_EXCHANGE = "cliente_event";
const RABBITMQ_ROUTING_KEY = "cliente.created";
const USER_QUEUE = "cliente_to_user_queue"; // Añadir esta cola específica

export async function clienteCreatedEvent(clienteUser) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declarar exchange
    await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: true });
    
    // Asegurar que existe la cola para el servicio de usuarios
    await channel.assertQueue(USER_QUEUE, { durable: true });
    await channel.bindQueue(USER_QUEUE, RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY);

    // Publicar el evento
    const message = JSON.stringify(clienteUser);
    channel.publish(
      RABBITMQ_EXCHANGE,
      RABBITMQ_ROUTING_KEY,
      Buffer.from(message)
    );

    console.log(
      `✅ Evento publicado en exchange "${RABBITMQ_EXCHANGE}", routing key "${RABBITMQ_ROUTING_KEY}": ${message}`
    );

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error publicando evento de cliente creado:", error);
  }
}