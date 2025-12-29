import { isEmail, isPhoneNumber } from 'class-validator';

export class ValidationHelper {
  static isValidTrackingId(trackingId: string): boolean {
    const pattern = /^[A-Z]{4}\d{6}[A-Z0-9]{6}$/;
    return pattern.test(trackingId);
  }

  static isValidEmail(email: string): boolean {
    return isEmail(email);
  }

  static isValidPhone(phone: string): boolean {
    return isPhoneNumber(phone);
  }

  static isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  static validateDimensions(dimensions: any): boolean {
    return (
      dimensions &&
      typeof dimensions.length === 'number' &&
      typeof dimensions.width === 'number' &&
      typeof dimensions.height === 'number' &&
      ['cm', 'in'].includes(dimensions.unit)
    );
  }
}
