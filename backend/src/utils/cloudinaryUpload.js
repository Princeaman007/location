import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Uploader une image sur Cloudinary depuis un buffer
 * @param {Buffer} fileBuffer - Le buffer du fichier
 * @param {String} folder - Le dossier Cloudinary
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<Object>} - Résultat de l'upload
 */
export const uploadToCloudinary = (fileBuffer, folder = 'vehicles', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ivoiredrive/${folder}`,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convertir le buffer en stream et uploader
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Supprimer une image de Cloudinary
 * @param {String} publicId - L'ID public de l'image
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploader plusieurs images sur Cloudinary
 * @param {Array<Buffer>} files - Tableau de buffers
 * @param {String} folder - Le dossier Cloudinary
 * @returns {Promise<Array>} - Résultats des uploads
 */
export const uploadMultipleToCloudinary = async (files, folder = 'vehicles') => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    return results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));
  } catch (error) {
    console.error('Erreur upload multiple:', error);
    throw error;
  }
};

/**
 * Supprimer plusieurs images de Cloudinary
 * @param {Array<String>} publicIds - Tableau d'IDs publics
 * @returns {Promise<Array>} - Résultats des suppressions
 */
export const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) =>
      deleteFromCloudinary(publicId)
    );
    
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error('Erreur suppression multiple:', error);
    throw error;
  }
};
