'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Province,
  District,
  Ward,
  VIETNAM_34_PROVINCES,
  BUILTIN_WARDS_BY_PROVINCE,
  getOldAddressNote,
} from '@/lib/vietnam-address';
import { MapPin, Info, Search, ChevronDown, Check, X } from 'lucide-react';

interface ExtendedWard extends Ward {
  districtName: string;
}

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
  className?: string;
}

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '-- Chọn --',
  searchPlaceholder = 'Gõ để tìm nhanh...',
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = options.filter((o) => {
    if (!search.trim()) return true;
    const cleanSearch = removeVietnameseAccents(search.trim());
    const cleanLabel = removeVietnameseAccents(o.label);
    return cleanLabel.includes(cleanSearch);
  });

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch('');
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm bg-white border rounded-xl text-left transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
            : isOpen
            ? 'border-[#1A94FF] ring-2 ring-[#1A94FF]/20 shadow-sm'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className={`truncate ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 ml-1 transition-transform ${
            isOpen ? 'rotate-180 text-[#1A94FF]' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[9999] left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-150">
          {/* Search bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs py-1.5 px-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto p-1 text-sm divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">Không tìm thấy kết quả</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[#1A94FF] font-semibold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1A94FF] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddressPicker({
  selectedProvince = '',
  selectedDistrict = '',
  selectedWard = '',
  streetAddress = '',
  onChange,
  required = true,
  className = 'space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200',
}: AddressPickerProps) {
  const [provinces] = useState<Province[]>(VIETNAM_34_PROVINCES);
  const [allWards, setAllWards] = useState<ExtendedWard[]>([]);

  const [province, setProvince] = useState(selectedProvince);
  const [district, setDistrict] = useState(selectedDistrict);
  const [ward, setWard] = useState(selectedWard);
  const [street, setStreet] = useState(streetAddress);
  const [oldNote, setOldNote] = useState('');

  // Synchronize internal state when props change externally
  useEffect(() => {
    if (selectedProvince !== undefined) setProvince(selectedProvince);
    if (selectedDistrict !== undefined) setDistrict(selectedDistrict);
    if (selectedWard !== undefined) setWard(selectedWard);
    if (streetAddress !== undefined) setStreet(streetAddress);
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress]);

  // Populate wards immediately when province changes using local dataset
  useEffect(() => {
    if (!province) {
      setAllWards([]);
      return;
    }

    const builtinWardsList = BUILTIN_WARDS_BY_PROVINCE[province] || [];
    const initialWards: ExtendedWard[] = builtinWardsList.map((wName, idx) => ({
      code: idx + 1,
      name: wName,
      districtName: '',
    }));
    setAllWards(initialWards);
  }, [province]);

  // Update note & notify parent whenever address fields change
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

  const handleProvinceSelect = (val: string) => {
    setProvince(val);
    setDistrict('');
    setWard('');
  };

  const handleWardSelect = (val: string) => {
    setWard(val);
  };

  const provinceOptions: Option[] = provinces.map((p) => ({
    value: p.name,
    label: p.name,
  }));

  const wardOptions: Option[] = allWards.map((w) => ({
    value: w.name,
    label: w.name,
  }));

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <MapPin className="w-4.5 h-4.5 text-[#1A94FF]" />
          Địa chỉ giao dịch / Xem hàng {required && <span className="text-red-500">*</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. Tỉnh / Thành phố Searchable Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tỉnh / Thành phố <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={provinceOptions}
            value={province}
            onChange={handleProvinceSelect}
            placeholder="-- Chọn Tỉnh/Thành phố --"
            searchPlaceholder="Gõ tên tỉnh để tìm nhanh..."
          />
        </div>

        {/* 2. Xã / Phường / Thị trấn Searchable Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Xã / Phường / Thị trấn {required && <span className="text-red-500">*</span>}
          </label>
          <SearchableSelect
            options={wardOptions}
            value={ward}
            onChange={handleWardSelect}
            disabled={!province}
            placeholder={
              !province
                ? '-- Vui lòng chọn Tỉnh/Thành trước --'
                : allWards.length === 0
                ? '-- Chọn Xã/Phường/Thị trấn --'
                : `-- Chọn Xã/Phường/Thị trấn (${allWards.length}) --`
            }
            searchPlaceholder="Gõ tên xã/phường để tìm nhanh..."
          />
        </div>
      </div>

      {/* Số nhà / Tên đường */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Số nhà, Tên đường / Thôn xóm</label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Ví dụ: Số 123 Đường Nguyễn Văn Cừ, Xóm 3..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A94FF]"
        />
      </div>

      {/* Ghi chú địa danh chuyển đổi Cũ <-> Mới */}
      {oldNote && (
        <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-700">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ghi chú địa chính:</span> {oldNote}
          </div>
        </div>
      )}
    </div>
  );
}
