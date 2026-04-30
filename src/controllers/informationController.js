const db = require('../config/database');
const { successResponse, errorResponse } = require('../helpers/response');
const logger = require('../helpers/logger');

// GET /banner
const getBanners = async (req, res) => {
  try {
    const [banners] = await db.execute(
      'SELECT id, banner_name, banner_image, description FROM banners'
    );
    return successResponse(res, 'Sukses', banners);
  } catch (err) {
    logger.error('Get banners error', { message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// POST /banner
const storeBanner = async (req, res) => {
  const { banner_name, banner_image, description } = req.body;

  if (!banner_name || !banner_image) {
    return errorResponse(res, 102, 'banner_name dan banner_image tidak boleh kosong');
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO banners (banner_name, banner_image, description) VALUES (?, ?, ?)',
      [banner_name, banner_image, description || null]
    );

    const [rows] = await db.execute(
      'SELECT id, banner_name, banner_image, description FROM banners WHERE id = ?',
      [result.insertId]
    );

    logger.info('Banner dibuat', { banner_name, id: result.insertId });
    return successResponse(res, 'Banner berhasil ditambahkan', rows[0]);
  } catch (err) {
    logger.error('Store banner error', { message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// PUT /banner/:id
const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { banner_name, banner_image, description } = req.body;

  if (!banner_name || !banner_image) {
    return errorResponse(res, 102, 'banner_name dan banner_image tidak boleh kosong');
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM banners WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return errorResponse(res, 102, 'Banner tidak ditemukan', 404);
    }

    await db.execute(
      'UPDATE banners SET banner_name = ?, banner_image = ?, description = ? WHERE id = ?',
      [banner_name, banner_image, description || null, id]
    );

    const [rows] = await db.execute(
      'SELECT id, banner_name, banner_image, description FROM banners WHERE id = ?',
      [id]
    );

    logger.info('Banner diupdate', { id, banner_name });
    return successResponse(res, 'Banner berhasil diupdate', rows[0]);
  } catch (err) {
    logger.error('Update banner error', { id, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// DELETE /banner/:id
const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.execute(
      'SELECT id, banner_name FROM banners WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return errorResponse(res, 102, 'Banner tidak ditemukan', 404);
    }

    await db.execute('DELETE FROM banners WHERE id = ?', [id]);

    logger.info('Banner dihapus', { id, banner_name: existing[0].banner_name });
    return successResponse(res, 'Banner berhasil dihapus', { id: existing[0].id, banner_name: existing[0].banner_name });
  } catch (err) {
    logger.error('Delete banner error', { id, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// GET /services
const getServices = async (req, res) => {
  try {
    const [services] = await db.execute(
      'SELECT service_code, service_name, service_icon, service_tariff FROM services'
    );
    const mapped = services.map((s) => ({
      ...s,
      service_tariff: parseFloat(s.service_tariff)
    }));
    return successResponse(res, 'Sukses', mapped);
  } catch (err) {
    logger.error('Get services error', { message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// POST /services
const storeService = async (req, res) => {
  const { service_code, service_name, service_icon, service_tariff } = req.body;

  if (!service_code || !service_name || !service_icon) {
    return errorResponse(res, 102, 'service_code, service_name, dan service_icon tidak boleh kosong');
  }
  if (service_tariff === undefined || isNaN(Number(service_tariff)) || Number(service_tariff) < 0) {
    return errorResponse(res, 102, 'service_tariff harus berupa angka positif');
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM services WHERE service_code = ?',
      [service_code]
    );
    if (existing.length > 0) {
      return errorResponse(res, 102, 'service_code sudah terdaftar');
    }

    const [result] = await db.execute(
      'INSERT INTO services (service_code, service_name, service_icon, service_tariff) VALUES (?, ?, ?, ?)',
      [service_code, service_name, service_icon, Number(service_tariff)]
    );

    const [rows] = await db.execute(
      'SELECT service_code, service_name, service_icon, service_tariff FROM services WHERE id = ?',
      [result.insertId]
    );

    const data = { ...rows[0], service_tariff: parseFloat(rows[0].service_tariff) };
    logger.info('Service dibuat', { service_code });
    return successResponse(res, 'Service berhasil ditambahkan', data);
  } catch (err) {
    logger.error('Store service error', { message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// PUT /services/:id
const updateService = async (req, res) => {
  const { id } = req.params;
  const { service_name, service_icon, service_tariff } = req.body;

  if (!service_name || !service_icon) {
    return errorResponse(res, 102, 'service_name dan service_icon tidak boleh kosong');
  }
  if (service_tariff === undefined || isNaN(Number(service_tariff)) || Number(service_tariff) < 0) {
    return errorResponse(res, 102, 'service_tariff harus berupa angka positif');
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM services WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return errorResponse(res, 102, 'Service tidak ditemukan', 404);
    }

    await db.execute(
      'UPDATE services SET service_name = ?, service_icon = ?, service_tariff = ? WHERE id = ?',
      [service_name, service_icon, Number(service_tariff), id]
    );

    const [rows] = await db.execute(
      'SELECT id, service_code, service_name, service_icon, service_tariff FROM services WHERE id = ?',
      [id]
    );

    const data = { ...rows[0], service_tariff: parseFloat(rows[0].service_tariff) };
    logger.info('Service diupdate', { id });
    return successResponse(res, 'Service berhasil diupdate', data);
  } catch (err) {
    logger.error('Update service error', { id, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// DELETE /services/:id
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.execute(
      'SELECT id, service_code, service_name FROM services WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return errorResponse(res, 102, 'Service tidak ditemukan', 404);
    }

    await db.execute('DELETE FROM services WHERE id = ?', [id]);

    logger.info('Service dihapus', { id, service_code: existing[0].service_code });
    return successResponse(res, 'Service berhasil dihapus', { id: existing[0].id, service_code: existing[0].service_code, service_name: existing[0].service_name });
  } catch (err) {
    logger.error('Delete service error', { id, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

module.exports = { getBanners, storeBanner, updateBanner, deleteBanner, getServices, storeService, updateService, deleteService };
