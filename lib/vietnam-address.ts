// Vietnam Administrative Units Helper & Old<->New Address Mapping

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

// Key mapping for notable administrative changes in Vietnam (Old -> New / Note)
export const VIETNAM_OLD_NEW_ADDRESS_MAPPING: Record<string, string> = {
  // TP. Hồ Chí Minh mergers
  'Thành phố Thủ Đức': 'Gồm Thành phố Thủ Đức cũ + Quận 2, Quận 9, Quận Thủ Đức cũ (TP.HCM)',
  'Quận 2': 'Nay thuộc Thành phố Thủ Đức (TP.HCM)',
  'Quận 9': 'Nay thuộc Thành phố Thủ Đức (TP.HCM)',
  'Quận Thủ Đức': 'Nay thuộc Thành phố Thủ Đức (TP.HCM)',
  // Hà Nội expansion
  'Tỉnh Hà Tây': 'Đã sáp nhập hoàn toàn vào Thành phố Hà Nội (từ năm 2008)',
  'Huyện Mê Linh': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Vĩnh Phúc)',
  'Thị xã Sơn Tây': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Quốc Oai': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Thạch Thất': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Chương Mỹ': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Đan Phượng': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Hoài Đức': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Mỹ Đức': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Phú Xuyên': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Phúc Thọ': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Thanh Oai': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Thường Tín': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  'Huyện Ung Hòa': 'Nay thuộc Thành phố Hà Nội (trước đây thuộc tỉnh Hà Tây)',
  // Da Nang / Quang Nam
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

// Fallback top provinces list in case open API is unreachable
export const FALLBACK_PROVINCES: Province[] = [
  {
    code: 1,
    name: 'Thành phố Hà Nội',
    districts: [
      { code: 1, name: 'Quận Ba Đình' },
      { code: 2, name: 'Quận Hoàn Kiếm' },
      { code: 3, name: 'Quận Tây Hồ' },
      { code: 4, name: 'Quận Cầu Giấy' },
      { code: 5, name: 'Quận Đống Đa' },
      { code: 6, name: 'Quận Hai Bà Trưng' },
      { code: 7, name: 'Quận Hoàng Mai' },
      { code: 8, name: 'Quận Thanh Xuân' },
      { code: 16, name: 'Quận Long Biên' },
      { code: 19, name: 'Quận Hà Đông' },
      { code: 250, name: 'Thị xã Sơn Tây' },
      { code: 268, name: 'Huyện Mê Linh' },
    ],
  },
  {
    code: 79,
    name: 'Thành phố Hồ Chí Minh',
    districts: [
      { code: 760, name: 'Thành phố Thủ Đức' },
      { code: 769, name: 'Quận 1' },
      { code: 770, name: 'Quận 3' },
      { code: 771, name: 'Quận 4' },
      { code: 772, name: 'Quận 5' },
      { code: 773, name: 'Quận 6' },
      { code: 774, name: 'Quận 7' },
      { code: 775, name: 'Quận 8' },
      { code: 776, name: 'Quận 10' },
      { code: 777, name: 'Quận 11' },
      { code: 778, name: 'Quận 12' },
      { code: 764, name: 'Quận Gò Vấp' },
      { code: 765, name: 'Quận Bình Thạnh' },
      { code: 766, name: 'Quận Tân Bình' },
      { code: 767, name: 'Quận Tân Phú' },
      { code: 768, name: 'Quận Phú Nhuận' },
      { code: 783, name: 'Huyện Bình Chánh' },
      { code: 784, name: 'Huyện Hóc Môn' },
      { code: 785, name: 'Huyện Củ Chi' },
    ],
  },
  {
    code: 48,
    name: 'Thành phố Đà Nẵng',
    districts: [
      { code: 490, name: 'Quận Hải Châu' },
      { code: 491, name: 'Quận Thanh Khê' },
      { code: 492, name: 'Quận Sơn Trà' },
      { code: 493, name: 'Quận Ngũ Hành Sơn' },
      { code: 494, name: 'Quận Liên Chiểu' },
      { code: 495, name: 'Quận Cẩm Lệ' },
    ],
  },
  {
    code: 74,
    name: 'Tỉnh Bình Dương',
    districts: [
      { code: 718, name: 'Thành phố Thủ Dầu Một' },
      { code: 719, name: 'Thành phố Thuận An' },
      { code: 720, name: 'Thành phố Dĩ An' },
      { code: 721, name: 'Thành phố Bến Cát' },
      { code: 722, name: 'Thành phố Tân Uyên' },
    ],
  },
  {
    code: 75,
    name: 'Tỉnh Đồng Nai',
    districts: [
      { code: 731, name: 'Thành phố Biên Hòa' },
      { code: 732, name: 'Thành phố Long Khánh' },
    ],
  },
  {
    code: 31,
    name: 'Thành phố Hải Phòng',
    districts: [
      { code: 303, name: 'Quận Hồng Bàng' },
      { code: 304, name: 'Quận Ngô Quyền' },
      { code: 305, name: 'Quận Lê Chân' },
    ],
  },
  {
    code: 92,
    name: 'Thành phố Cần Thơ',
    districts: [
      { code: 916, name: 'Quận Ninh Kiều' },
      { code: 917, name: 'Quận Bình Thủy' },
      { code: 918, name: 'Quận Cái Răng' },
    ],
  },
];
