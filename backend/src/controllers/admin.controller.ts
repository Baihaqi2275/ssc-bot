import { Request, Response } from "express";
import bcrypt from "bcrypt";

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