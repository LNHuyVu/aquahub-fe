// Vietnam Administrative Units Helper & Old<->New Address Mapping
import provinceDataRaw from './address-vn/province.json';
import wardDataRaw from './address-vn/ward.json';

export interface Province {
  code: number;
  name: string;
  districts?: District[];
}

export interface District {
  code: number;
  name: string;
  wards?: Ward[];
}

export interface Ward {
  code: number;
  name: string;
}

export interface RawProvince {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

export interface RawWard {
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

const provinceDict = provinceDataRaw as unknown as Record<string, RawProvince>;
const wardDict = wardDataRaw as unknown as Record<string, RawWard>;

// Key mapping for notable administrative changes in Vietnam (Old -> New / Note)
export const VIETNAM_OLD_NEW_ADDRESS_MAPPING: Record<string, string> = {
  'Thành phố Thủ Đức': 'Gồm Thành phố Thủ Đức cũ + Quận 2, Quận 9, Quận Thủ Đức cũ (TP.HCM)',
  'Quận 2': 'Nay thuộc Thành phố Thủ Đức (TP.HCM)',
  'Quận 9': 'Nay thuộc Thành phố Thủ Đức (TP.HCM)',
  'Quận Thủ Đức': 'Nay thuộc Thành phố Thủ Đức (TP.HCM)',
  'Tỉnh Hà Tây': 'Đã sáp nhập hoàn toàn vào Thành phố Hà Nội (từ năm 2008)',
  'Huyện Mê Linh': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Vĩnh Phúc)',
  'Thị xã Sơn Tây': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Tỉnh Quảng Nam - Đà Nẵng': 'Đã tách thành TP. Đà Nẵng và Tỉnh Quảng Nam (từ năm 1997)',
};

/**
 * Checks if a given province/district/ward name has an old<->new mapping note.
 */
export function getOldAddressNote(province?: string, district?: string): string {
  const notes: string[] = [];
  if (district && VIETNAM_OLD_NEW_ADDRESS_MAPPING[district]) {
    notes.push(`${district}: ${VIETNAM_OLD_NEW_ADDRESS_MAPPING[district]}`);
  }
  if (province && VIETNAM_OLD_NEW_ADDRESS_MAPPING[province]) {
    notes.push(`${province}: ${VIETNAM_OLD_NEW_ADDRESS_MAPPING[province]}`);
  }
  return notes.join(' | ');
}

// Export 34 provinces generated directly from address-vn/province.json
export const VIETNAM_34_PROVINCES: Province[] = Object.values(provinceDict).map((p) => ({
  code: parseInt(p.code, 10),
  name: p.name_with_type,
}));

export const FALLBACK_PROVINCES: Province[] = VIETNAM_34_PROVINCES;

// Build wards mapping from address-vn/ward.json
export const BUILTIN_WARDS_BY_PROVINCE: Record<string, string[]> = {};
export const FULL_WARDS_BY_PROVINCE: Record<string, { code: number; name: string }[]> = {};

Object.values(provinceDict).forEach((p) => {
  const pWards = Object.values(wardDict).filter((w) => w.parent_code === p.code);
  const wardNames = pWards.map((w) => w.name_with_type);

  BUILTIN_WARDS_BY_PROVINCE[p.name_with_type] = wardNames;
  BUILTIN_WARDS_BY_PROVINCE[p.name] = wardNames;

  const wardObjects = pWards.map((w) => ({
    code: parseInt(w.code, 10),
    name: w.name_with_type,
  }));
  FULL_WARDS_BY_PROVINCE[p.name_with_type] = wardObjects;
  FULL_WARDS_BY_PROVINCE[p.name] = wardObjects;
});

/**
 * Get wards for a province name (supports both "Thành phố Hà Nội" and "Hà Nội")
 */
export function getWardsForProvince(provinceName: string): { code: number; name: string }[] {
  if (!provinceName) return [];
  if (FULL_WARDS_BY_PROVINCE[provinceName]) {
    return FULL_WARDS_BY_PROVINCE[provinceName];
  }
  const foundKey = Object.keys(FULL_WARDS_BY_PROVINCE).find(
    (k) => provinceName.includes(k) || k.includes(provinceName)
  );
  return foundKey ? FULL_WARDS_BY_PROVINCE[foundKey] : [];
}
