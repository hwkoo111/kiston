import React from "react";

function CitySelector({ cityList, selectedCity, onChange }) {
  return (
    <div className="flex justify-center mb-8">
      <select
        className="p-2 rounded-lg border shadow min-w-[140px] text-lg"
        value={selectedCity}
        onChange={e => onChange(e.target.value)}
      >
        {cityList.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}

export default CitySelector;
