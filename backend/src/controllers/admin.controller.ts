import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/database";

import { chatSessions, chatMessages } from "./chat.controller";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [userRows]: any = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
    const totalUsers = userRows[0].total;

    return res.json({
      status: "success",
      data: {
        totalUsers,
        activeChats: chatSessions.length,
        totalMessages: chatMessages.length,
        aiTokensUsed: chatMessages.length * 15 // just an estimate for now
      }
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Gagal mengambil statistik" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const [userRows]: any = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'user' ORDER BY id DESC LIMIT 5"
    );
    
    const userActivities = userRows.map((user: any) => {
      const timestamp = parseInt(user.id);
      const dateStr = isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
      return {
        id: `user-${user.id}`,
        type: "register",
        name: user.name,
        action: "mendaftar akun baru",
        created_at: dateStr
      };
    });

    const chatActivities = chatSessions.map(session => ({
      id: `chat-${session.id}`,
      type: "chat",
      name: "Mahasiswa",
      action: "menggunakan chatbot",
      created_at: session.createdAt
    }));

    const allActivities = [...userActivities, ...chatActivities].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const recent = allActivities.slice(0, 10);

    return res.json({
      status: "success",
      data: recent
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Gagal mengambil notifikasi" });
  }
};

let admins: any[] = [];

export const getAllAdmins = async (req: Request, res: Response) => {
  return res.json({
    status: "success",
    message: "Data admin berhasil diambil",
    data: admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    })),
  });
};

export const getAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const admin = admins.find((item) => item.id === id);

  if (!admin) {
    return res.status(404).json({
      status: "error",
      message: "Admin tidak ditemukan",
    });
  }

  return res.json({
    status: "success",
    message: "Detail admin berhasil diambil",
    data: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

export const createAdmin = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Nama, email, dan password wajib diisi",
    });
  }

  const existingAdmin = admins.find((admin) => admin.email === email);

  if (existingAdmin) {
    return res.status(400).json({
      status: "error",
      message: "Email sudah terdaftar",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newAdmin = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash,
    role: role || "admin",
  };

  admins.push(newAdmin);

  return res.status(201).json({
    status: "success",
    message: "Admin berhasil ditambahkan",
    data: {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  });
};

export const updateAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const adminIndex = admins.findIndex((admin) => admin.id === id);

  if (adminIndex === -1) {
    return res.status(404).json({
      status: "error",
      message: "Admin tidak ditemukan",
    });
  }

  admins[adminIndex] = {
    ...admins[adminIndex],
    name: name || admins[adminIndex].name,
    email: email || admins[adminIndex].email,
    role: role || admins[adminIndex].role,
  };

  return res.json({
    status: "success",
    message: "Admin berhasil diperbarui",
    data: {
      id: admins[adminIndex].id,
      name: admins[adminIndex].name,
      email: admins[adminIndex].email,
      role: admins[adminIndex].role,
    },
  });
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  const adminIndex = admins.findIndex((admin) => admin.id === id);

  if (adminIndex === -1) {
    return res.status(404).json({
      status: "error",
      message: "Admin tidak ditemukan",
    });
  }

  admins.splice(adminIndex, 1);

  return res.json({
    status: "success",
    message: "Admin berhasil dihapus",
  });
};