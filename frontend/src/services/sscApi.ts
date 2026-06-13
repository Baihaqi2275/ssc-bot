const API_URL = "http://localhost:5000/api";

export const startChat = async (name: string, phone_number: string) => {
  const response = await fetch(`${API_URL}/chat/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phone_number,
    }),
  });

  return response.json();
};

export const sendChatMessage = async (
  user_id: string,
  session_id: string,
  message: string,
) => {
  const response = await fetch(`${API_URL}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id,
      session_id,
      message,
    }),
  });

  return response.json();
};