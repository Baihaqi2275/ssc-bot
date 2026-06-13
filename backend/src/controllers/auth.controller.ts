import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/auth.middleware";
const admins: any[] = [];

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

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
      role: "admin",
    };

    admins.push(newAdmin);

    return res.status(201).json({
      status: "success",
      message: "Register admin berhasil",
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email dan password wajib diisi",
      });
    }

    const admin = admins.find((admin) => admin.email === email);

    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin tidak ditemukan",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Password salah",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1d",
      }
    );

    return res.json({
      status: "success",
      message: "Login berhasil",
      token,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
    });
  }
};
export const getProfileAdmin = async (req: AuthRequest, res: Response) => {
  try {
    return res.json({
      status: "success",
      message: "Profil admin berhasil diambil",
      data: req.admin,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
    });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
  return res.json({
    status: "success",
    message: "Logout berhasil. Silakan hapus token di frontend.",
  });
};