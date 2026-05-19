// src/components/common/AddressSelector.jsx
// Chọn Tỉnh/Huyện/Xã tự động + gợi ý tên đường
// Dữ liệu từ API: https://provinces.open-api.vn/api/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, ChevronDown, Loader } from 'lucide-react';
import './AddressSelector.css';

// Danh sách tên đường phổ biến Việt Nam để gợi ý khi gõ
const COMMON_STREETS = [
  'Nguyễn Huệ','Nguyễn Trãi','Nguyễn Văn Cừ','Nguyễn Thị Minh Khai',
  'Nguyễn Đình Chiểu','Nguyễn Công Trứ','Nguyễn Bỉnh Khiêm','Nguyễn Chí Thanh',
  'Lê Lợi','Lê Duẩn','Lê Văn Sỹ','Lê Hồng Phong','Lê Thị Hồng Gấm',
  'Trần Hưng Đạo','Trần Phú','Trần Quốc Toản','Trần Bình Trọng',
  'Lý Thường Kiệt','Lý Tự Trọng','Lý Nam Đế',
  'Hai Bà Trưng','Đinh Tiên Hoàng','Đinh Lễ',
  'Hoàng Văn Thụ','Hoàng Diệu','Hoàng Hoa Thám',
  'Phan Đình Phùng','Phan Chu Trinh','Phan Bội Châu','Phan Xích Long',
  'Võ Thị Sáu','Võ Văn Tần','Võ Nguyên Giáp',
  'Điện Biên Phủ','Cách Mạng Tháng 8','Nam Kỳ Khởi Nghĩa',
  'Cộng Hòa','Trường Chinh','Tô Hiến Thành','Tô Ký',
  'Bùi Thị Xuân','Bùi Viện','Bùi Thị Thu','Bùi Đình Túy',
  'Phạm Ngũ Lão','Phạm Hùng','Phạm Văn Đồng',
  'Quang Trung','Trung Sơn','Tây Sơn',
  'Hùng Vương','Hai Bà Trưng','Bà Triệu',
  'Thống Nhất','Độc Lập','Hòa Bình','Tự Do',
  'Âu Cơ','Lạc Long Quân','An Dương Vương',
  'Kinh Dương Vương','Hồng Bàng','Trưng Nữ Vương',
];

/**
 * Gợi ý tên đường thông minh dựa trên input
 * @param {string} input - Chuỗi người dùng đang gõ
 * @param {string} district - Quận/Huyện đã chọn (để tạo gợi ý có số nhà)
 * @returns {string[]} Danh sách gợi ý
 */
const getSuggestions = (input, district) => {
  if (!input || input.length < 2) return [];

  // Tách số nhà và tên đường (vd: "123 Nguyễn" → number="123", street="Nguyễn")
  const match = input.match(/^(\d+\s*)?(.*)/);
  const houseNum = match?.[1]?.trim() || '';
  const streetPart = match?.[2]?.trim().toLowerCase() || '';

  if (!streetPart) return [];

  const filtered = COMMON_STREETS.filter(s =>
    s.toLowerCase().includes(streetPart) ||
    // Không dấu matching
    removeAccents(s).toLowerCase().includes(removeAccents(streetPart))
  ).slice(0, 6);

  return filtered.map(s => houseNum ? `${houseNum} ${s}` : s);
};

const removeAccents = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

// ============================================================
// COMPONENT
// ============================================================
const AddressSelector = ({ value = {}, onChange, required = false }) => {
  const [provinces, setProvinces]   = useState([]);
  const [districts, setDistricts]   = useState([]);
  const [wards, setWards]           = useState([]);
  const [loadingP, setLoadingP]     = useState(false);
  const [loadingD, setLoadingD]     = useState(false);
  const [loadingW, setLoadingW]     = useState(false);
  const [streetInput, setStreetInput] = useState(value.street || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg]     = useState(false);
  const streetRef = useRef(null);
  const suggRef   = useRef(null);

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    setLoadingP(true);
    fetch('https://provinces.open-api.vn/api/p/')
      .then(r => r.json())
      .then(data => setProvinces(data || []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingP(false));
  }, []);

  // Khi chọn tỉnh → lấy huyện
  const handleProvinceChange = async (e) => {
    const code = e.target.value;
    const name = provinces.find(p => String(p.code) === code)?.name || '';

    onChange({ ...value, province: name, province_code: code, district: '', district_code: '', ward: '', ward_code: '' });
    setDistricts([]); setWards([]);

    if (!code) return;
    setLoadingD(true);
    try {
      const res  = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch { setDistricts([]); }
    finally { setLoadingD(false); }
  };

  // Khi chọn huyện → lấy xã/phường
  const handleDistrictChange = async (e) => {
    const code = e.target.value;
    const name = districts.find(d => String(d.code) === code)?.name || '';

    onChange({ ...value, district: name, district_code: code, ward: '', ward_code: '' });
    setWards([]);

    if (!code) return;
    setLoadingW(true);
    try {
      const res  = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
    } catch { setWards([]); }
    finally { setLoadingW(false); }
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    const name = wards.find(w => String(w.code) === code)?.name || '';
    onChange({ ...value, ward: name, ward_code: code });
  };

  // Xử lý gợi ý đường
  const handleStreetChange = (e) => {
    const v = e.target.value;
    setStreetInput(v);
    onChange({ ...value, street: v });
    setSuggestions(getSuggestions(v, value.district));
    setShowSugg(true);
  };

  const selectSuggestion = (s) => {
    setStreetInput(s);
    onChange({ ...value, street: s });
    setShowSugg(false);
    setSuggestions([]);
  };

  // Đóng suggestion khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (suggRef.current && !suggRef.current.contains(e.target) &&
          streetRef.current && !streetRef.current.contains(e.target)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="address-selector">
      {/* Tỉnh/Thành phố */}
      <div className="addr-row">
        <div className="form-group">
          <label className="form-label">
            <MapPin size={14} /> Tỉnh / Thành phố {required && <span className="req">*</span>}
          </label>
          <div className="select-wrap">
            <select
              className="form-input addr-select"
              value={value.province_code || ''}
              onChange={handleProvinceChange}
              required={required}
              disabled={loadingP}
            >
              <option value="">
                {loadingP ? 'Đang tải...' : '-- Chọn Tỉnh/Thành phố --'}
              </option>
              {provinces.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            {loadingP ? <Loader size={16} className="select-loader spinning" />
                      : <ChevronDown size={16} className="select-icon" />}
          </div>
        </div>

        {/* Quận/Huyện */}
        <div className="form-group">
          <label className="form-label">
            Quận / Huyện {required && <span className="req">*</span>}
          </label>
          <div className="select-wrap">
            <select
              className="form-input addr-select"
              value={value.district_code || ''}
              onChange={handleDistrictChange}
              required={required}
              disabled={!value.province_code || loadingD}
            >
              <option value="">
                {loadingD ? 'Đang tải...' : districts.length === 0 && value.province_code
                  ? 'Không có dữ liệu' : '-- Chọn Quận/Huyện --'}
              </option>
              {districts.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            {loadingD ? <Loader size={16} className="select-loader spinning" />
                      : <ChevronDown size={16} className="select-icon" />}
          </div>
        </div>
      </div>

      {/* Phường/Xã */}
      <div className="form-group">
        <label className="form-label">
          Phường / Xã {required && <span className="req">*</span>}
        </label>
        <div className="select-wrap">
          <select
            className="form-input addr-select"
            value={value.ward_code || ''}
            onChange={handleWardChange}
            required={required}
            disabled={!value.district_code || loadingW}
          >
            <option value="">
              {loadingW ? 'Đang tải...' : wards.length === 0 && value.district_code
                ? 'Không có dữ liệu' : '-- Chọn Phường/Xã --'}
            </option>
            {wards.map(w => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
          {loadingW ? <Loader size={16} className="select-loader spinning" />
                    : <ChevronDown size={16} className="select-icon" />}
        </div>
      </div>

      {/* Số nhà / Tên đường (có autocomplete) */}
      <div className="form-group street-group" style={{ position: 'relative' }}>
        <label className="form-label">
          Số nhà, Tên đường {required && <span className="req">*</span>}
        </label>
        <input
          ref={streetRef}
          type="text"
          className="form-input"
          placeholder="VD: 123 Nguyễn Huệ"
          value={streetInput}
          onChange={handleStreetChange}
          onFocus={() => suggestions.length > 0 && setShowSugg(true)}
          required={required}
          autoComplete="off"
        />

        {/* Danh sách gợi ý */}
        {showSugg && suggestions.length > 0 && (
          <ul className="street-suggestions" ref={suggRef}>
            {suggestions.map((s, i) => (
              <li key={i} onMouseDown={() => selectSuggestion(s)}>
                <MapPin size={13} /> {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddressSelector;
