const db = require('../config/database');
const { successResponse, errorResponse } = require('../helpers/response');
const logger = require('../helpers/logger');

// GET /banner
const getBanners = async (req, res) => {
  try {
    const [banners] = await db.execute(
      'SELECT banner_name, banner_image, description FROM banners'
    );
    return successResponse(res, 'Sukses', banners);
  } catch (err) {
    logger.error('Get banners error', { message: err.message });
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

module.exports = { getBanners, getServices };
