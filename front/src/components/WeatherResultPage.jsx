import React, { useState, useEffect } from "react";
import CitySelector from "./CitySelector";

function WeatherResultPage() {
  const [data, setData] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    fetch("/all_city_weather_summary.json")
      .then(res => res.json())
      .then(json => {
        setData(json);
        const cities = Array.from(new Set(json.map(d => d.city)));
        setCityList(cities);
        setSelectedCity(cities[0]);
      });
  }, []);

  const filtered = data.filter(d => d.city === selectedCity);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-extrabold mb-5 text-center">도시별 계절 평균기온 & 옷차림 추천</h1>
      {cityList.length > 0 && (
        <CitySelector cityList={cityList} selectedCity={selectedCity} onChange={setSelectedCity} />
      )}
      <div className="rounded-xl shadow bg-white p-6">
        <table className="w-full text-center border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gray-100 rounded-xl">
              <th className="py-2 px-2">연도</th>
              <th className="py-2 px-2">시즌</th>
              <th className="py-2 px-2">평균기온 (℃)</th>
              <th className="py-2 px-2">추천 옷차림</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={idx} className="rounded-lg hover:bg-gray-50 transition">
                <td className="py-1">{item.year}</td>
                <td className="py-1 capitalize">{item.season}</td>
                <td className="py-1">{item.avg_temp}</td>
                <td className="py-1">{item.recommend_outfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-4 text-gray-500">데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default WeatherResultPage;
