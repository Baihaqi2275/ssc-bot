import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { extractFileText } from "../utils/extractFileText";
import { chunkText } from "../utils/chunkText";

export const documents: any[] = [];
export const documentChunks: any[] = [];

const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];

const createDocumentAndChunks = async (
  filePath: string,
  originalFileName: string,
  source: "dataset" | "upload",
  title?: string,
  storedFileName?: string
) => {
  const ext = path.extname(originalFileName).toLowerCase();
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

const fileUrl =
  source === "dataset"
    ? `${baseUrl}/files/dataset/${encodeURIComponent(originalFileName)}`
    : `${baseUrl}/files/uploads/${encodeURIComponent(storedFileName || originalFileName)}`;
  let extractedText = "";

  try {
    extractedText = await extractFileText(filePath);
  } catch (error: any) {
    console.log(`Gagal membaca file ${originalFileName}:`, error.message);
    extractedText = "";
  }

  const documentId =
    Date.now().toString() + Math.random().toString(36).substring(2);

  const chunks = chunkText(extractedText);

  const newDocument = {
    id: documentId,
    title: title || originalFileName,
    file_name: originalFileName,
    stored_file_name: storedFileName || originalFileName,
    file_type: ext,
    file_path: filePath,
    text: extractedText,
    text_length: extractedText.length,
    text_preview: extractedText.substring(0, 300),
    total_chunks: chunks.length,
    status: extractedText ? "ready" : "failed",
    source,
    created_at: new Date(),
    file_url: fileUrl,
  };

  documents.push(newDocument);

  chunks.forEach((chunk, index) => {
    documentChunks.push({
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      document_id: documentId,
      document_title: newDocument.title,
      file_name: originalFileName,
      file_type: ext,
      chunk_index: index + 1,
      chunk_text: chunk,
      chunk_preview: chunk.substring(0, 300),
      source,
      file_path: filePath,
      created_at: new Date(),
      file_url: fileUrl,
    });
  });

  return newDocument;
};

export const loadDatasetToMemory = async () => {
  const datasetPath = path.join(process.cwd(), "../dataset");

  if (!fs.existsSync(datasetPath)) {
    console.log("Folder dataset tidak ditemukan:", datasetPath);
    return {
      total: 0,
      message: "Folder dataset tidak ditemukan",
    };
  }

  const files = fs.readdirSync(datasetPath);

  const validFiles = files.filter((file) =>
    allowedExtensions.includes(path.extname(file).toLowerCase())
  );

  let importedCount = 0;

  for (const file of validFiles) {
    const filePath = path.join(datasetPath, file);

    const existingDocument = documents.find(
      (doc) => doc.file_path === filePath && doc.source === "dataset"
    );

    if (existingDocument) {
      continue;
    }

    await createDocumentAndChunks(filePath, file, "dataset");
    importedCount++;
  }

  console.log(`Dataset berhasil dimuat: ${importedCount} dokumen`);

  return {
    total: importedCount,
    message: "Dataset berhasil dimuat",
  };
};

export const importDatasetDocuments = async (req: Request, res: Response) => {
  try {
    const datasetPath = path.join(process.cwd(), "../dataset");

    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({
        status: "error",
        message: "Folder dataset tidak ditemukan",
        path: datasetPath,
      });
    }

    const files = fs.readdirSync(datasetPath);

    const validFiles = files.filter((file) =>
      allowedExtensions.includes(path.extname(file).toLowerCase())
    );

    if (validFiles.length === 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Tidak ada file PDF, DOC, DOCX, XLS, atau XLSX di folder dataset",
      });
    }

    const importedDocuments = [];

    for (const file of validFiles) {
      const filePath = path.join(datasetPath, file);

      const existingDocument = documents.find(
        (doc) => doc.file_path === filePath && doc.source === "dataset"
      );

      if (existingDocument) {
        importedDocuments.push(existingDocument);
        continue;
      }

      const newDocument = await createDocumentAndChunks(
        filePath,
        file,
        "dataset"
      );

      importedDocuments.push(newDocument);
    }

    return res.status(201).json({
      status: "success",
      message: "Dataset berhasil diimport, dibaca, dan dipotong menjadi chunk",
      total: importedDocuments.length,
      data: importedDocuments.map((doc) => ({
        id: doc.id,
        title: doc.title,
        file_name: doc.file_name,
        file_type: doc.file_type,
        text_length: doc.text_length,
        total_chunks: doc.total_chunks,
        text_preview: doc.text_preview,
        status: doc.status,
        source: doc.source,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Gagal import dataset",
    });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "File wajib diupload",
      });
    }

    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        status: "error",
        message: "File tidak valid. Hanya PDF, DOC, DOCX, XLS, dan XLSX.",
      });
    }

    const newDocument = await createDocumentAndChunks(
      file.path,
      file.originalname,
      "upload",
      req.body?.title || file.originalname,
      file.filename
    );

    return res.status(201).json({
      status: "success",
      message: "Dokumen berhasil diupload, dibaca, dan dipotong menjadi chunk",
      data: {
        id: newDocument.id,
        title: newDocument.title,
        file_name: newDocument.file_name,
        stored_file_name: newDocument.stored_file_name,
        file_type: newDocument.file_type,
        file_path: newDocument.file_path,
        text_length: newDocument.text_length,
        total_chunks: newDocument.total_chunks,
        text_preview: newDocument.text_preview,
        status: newDocument.status,
        source: newDocument.source,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat upload dokumen",
    });
  }
};

export const getAllDocuments = async (req: Request, res: Response) => {
  return res.json({
    status: "success",
    message: "Data dokumen berhasil diambil",
    total: documents.length,
    data: documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      file_name: doc.file_name,
      stored_file_name: doc.stored_file_name,
      file_type: doc.file_type,
      file_path: doc.file_path,
      text_length: doc.text_length,
      total_chunks: doc.total_chunks,
      text_preview: doc.text_preview,
      status: doc.status,
      source: doc.source,
      created_at: doc.created_at,
    })),
  });
};

export const getDocumentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const document = documents.find((item) => item.id === id);

  if (!document) {
    return res.status(404).json({
      status: "error",
      message: "Dokumen tidak ditemukan",
    });
  }

  return res.json({
    status: "success",
    message: "Detail dokumen berhasil diambil",
    data: document,
  });
};

export const getAllDocumentChunks = async (req: Request, res: Response) => {
  return res.json({
    status: "success",
    message: "Data chunk dokumen berhasil diambil",
    total: documentChunks.length,
    data: documentChunks.map((chunk) => ({
      id: chunk.id,
      document_id: chunk.document_id,
      document_title: chunk.document_title,
      file_name: chunk.file_name,
      file_type: chunk.file_type,
      chunk_index: chunk.chunk_index,
      chunk_preview: chunk.chunk_preview,
      source: chunk.source,
    })),
  });
};

export const getChunksByDocumentId = async (req: Request, res: Response) => {
  const { id } = req.params;

  const chunks = documentChunks.filter((chunk) => chunk.document_id === id);

  if (chunks.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "Chunk untuk dokumen ini tidak ditemukan",
    });
  }

  return res.json({
    status: "success",
    message: "Chunk dokumen berhasil diambil",
    total: chunks.length,
    data: chunks,
  });
};

export const deleteDocument = async (req: Request, res: Response) => {
  const { id } = req.params;

  const index = documents.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: "Dokumen tidak ditemukan",
    });
  }

  documents.splice(index, 1);

  for (let i = documentChunks.length - 1; i >= 0; i--) {
    if (documentChunks[i].document_id === id) {
      documentChunks.splice(i, 1);
    }
  }

  return res.json({
    status: "success",
    message: "Dokumen dan chunk berhasil dihapus",
  });
};