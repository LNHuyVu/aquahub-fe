'use client';

import { useState, useEffect } from 'react';
import {
  Province,
  District,
  FALLBACK_PROVINCES,
  getOldAddressNote,
} from '@/lib/vietnam-address';
import { MapPin, Info } from 'lucide-react';

interface AddressPickerProps {
  selectedProvince?: string;
  selectedDistrict?: string;
  selectedWard?: string;
  streetAddress?: string;
  onChange: (address: {
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
    oldAddressNote: string;
  }) => void;
  required?: boolean;
}

export default function AddressPicker({
  selectedProvince = '',
  selectedDistrict = '',
  selectedWard = '',
  streetAddress = '',
  onChange,
  required = true,
}: AddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>(FALLBACK_PROVINCES);
  const [districts, setDistricts] = useState<District[]>([]);

  const [province, setProvince] = useState(selectedProvince);
  const [district, setDistrict] = useState(selectedDistrict);
  const [ward, setWard] = useState(selectedWard);
  const [street, setStreet] = useState(streetAddress);
  const [oldNote, setOldNote] = useState('');

  // Fetch full list of provinces from open API on mount
  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProvinces(data);
          }
        }
      } catch (err) {
        console.warn('Using fallback provinces data due to network error:', err);
      }
    }
    loadProvinces();
  }, []);

  // Sync selected province -> load districts
  useEffect(() => {
    if (!province) {
      setDistricts([]);
      return;
    }
    const foundProv = provinces.find((p) => p.name === province);
    if (foundProv && foundProv.districts) {
      setDistricts(foundProv.districts);
    } else {
      // Fetch districts for this province
      fetch(`https://provinces.open-api.vn/api/p/${foundProv?.code}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.districts) {
            setDistricts(data.districts);
          }
        })
        .catch(() => {
          // Fallback check
          const fb = FALLBACK_PROVINCES.find((p) => p.name === province);
          setDistricts(fb?.districts || []);
        });
    }
  }, [province, provinces]);

  // Update note whenever province or district changes
  useEffect(() => {
    const note = getOldAddressNote(province, district);
    setOldNote(note);
    onChange({
      province,
      district,
      ward,
      streetAddress: street,
      oldAddressNote: note,
    });
  }, [province, district, ward, street]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProvince(val);
    setDistrict('');
    setWard('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDistrict(val);
    setWard('');
  };

  return (
    <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <MapPin className="w-4 h-4 text-[#1A94FF]" />
        Địa chỉ bán hàng / Xem hàng {required && <span className="text-red-500">*</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tỉnh / Thành phố */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tỉnh / Thành phố</label>
          <select
            value={province}
            onChange={handleProvinceChange}
            required={required}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
          >
            <option value="">-- Chọn Tỉnh/Thành --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quận / Huyện */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Quận / Huyện</label>
          <select
            value={district}
            onChange={handleDistrictChange}
            disabled={!province}
            required={required}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A94FF] disabled:opacity-50"
          >
            <option value="">-- Chọn Quận/Huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Phường / Xã */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Phường / Xã (Không bắt buộc)</label>
          <input
            type="text"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            placeholder="Ví dụ: Phường 15, Xã Tân Nhựt..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
          />
        </div>
      </div>

      {/* Số nhà / Tên đường */}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Số nhà, Tên đường</label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Ví dụ: 123 Đường Nguyễn Văn Cừ..."
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
        />
      </div>

      {/* Chuyển đổi địa danh Cũ <-> Mới */}
      {oldNote && (
        <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">Ghi chú địa chính:</span> {oldNote}
          </div>
        </div>
      )}
    </div>
  );
}
