import React, { useState, useEffect } from "react";
import { FaTshirt, FaSocks } from "react-icons/fa";
import { GiClothes } from "react-icons/gi";
import "./WeatherResultPage.css";

const countryKor = {
  Australia: "호주",
  Philippines: "필리핀",
  Vietnam: "베트남",
  Japan: "일본",
};
const cityKor = {
  Brisbane: "브리즈번",
  Cebu: "세부",
  Danang: "다낭",
  Kyoto: "교토",
  Sydney: "시드니",
  Tokyo: "도쿄",
};

const monthList = Array.from({ length: 12 }, (_, i) => i + 1);

export default function WeatherResultPage() {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [years, setYears] = useState([]);
  const [selCountry, setSelCountry] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selYear, setSelYear] = useState(null);
  const [selMonth, setSelMonth] = useState(1);
  const [viewType, setViewType] = useState("monthly"); // "monthly" or "daily"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. 데이터 로드
  useEffect(() => {
    fetch("/all_city_weather_summary.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        // countries, cities 값은 반드시 영문!
        const countryList = Array.from(
          new Set(json.map((d) => d.country))
        ).sort();
        setCountries(countryList);
        setSelCountry(countryList[0] || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2. 국가 → 도시 (영문 기준)
  useEffect(() => {
    if (!selCountry) return;
    const list = Array.from(
      new Set(data.filter((d) => d.country === selCountry).map((d) => d.city))
    ).sort();
    setCities(list);
    setSelCity(list[0] || "");
  }, [selCountry, data]);

  // 3. 도시 → 연도 (영문 기준)
  useEffect(() => {
    if (!selCity) return;
    const list = Array.from(
      new Set(
        data
          .filter(
            (d) => d.country === selCountry && d.city === selCity && d.date
          )
          .map((d) => d.year)
      )
    ).sort();
    setYears(list);
    setSelYear(list[0] || null);
  }, [selCountry, selCity, data]);

  // 4. 월 선택 초기화(연도 변경 시)
  useEffect(() => {
    setSelMonth(1);
  }, [selYear, selCity, selCountry]);

  if (loading)
    return (
      <div className="wrp">
        <p>로딩 중…</p>
      </div>
    );
  if (error)
    return (
      <div className="wrp">
        <p>데이터 로드 오류: {error}</p>
      </div>
    );

  // 월별 요약: 해당 연도 1~12월 전체 표
  const monthlySummaries = monthList
    .map((month) =>
      data.find(
        (d) =>
          d.country === selCountry &&
          d.city === selCity &&
          Number(d.year) === Number(selYear) &&
          Number(d.month) === Number(month) &&
          (d.date == null || d.date === "" || d.date === undefined)
      )
    )
    .filter(Boolean);

  // 일별 상세: 선택 월만
  const dailyData = data
    .filter(
      (d) =>
        d.country === selCountry &&
        d.city === selCity &&
        Number(d.year) === Number(selYear) &&
        Number(d.month) === Number(selMonth) &&
        d.date
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // 선택 월 전체 평균
  const monthlyAvg = dailyData.length
    ? (
        dailyData.reduce((sum, x) => sum + Number(x.avg_temp), 0) /
        dailyData.length
      ).toFixed(2)
    : null;

  const iconByOutfit = (txt) => {
    if (!txt) return null;
    if (txt.includes("반팔")) return <FaTshirt />;
    if (txt.includes("긴팔") || txt.includes("가디건")) return <GiClothes />;
    return <FaSocks />;
  };

  return (
    <div className="wrp">
      <h1 className="title">날씨별 옷 추천</h1>

      {/* 셀렉터 - value는 영문, 한글은 표시만 */}
      <div className="selectors">
        <select
          className="sel"
          value={selCountry}
          onChange={(e) => setSelCountry(e.target.value)}
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {countryKor[c] || c}
            </option>
          ))}
        </select>
        <select
          className="sel"
          value={selCity}
          onChange={(e) => setSelCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {cityKor[c] || c}
            </option>
          ))}
        </select>
        <select
          className="sel"
          value={selYear || ""}
          onChange={(e) => setSelYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
        {viewType === "daily" && (
          <select
            className="sel"
            value={selMonth}
            onChange={(e) => setSelMonth(Number(e.target.value))}
          >
            {monthList.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 뷰 토글 */}
      <div className="view-toggle">
        <button
          className={
            viewType === "monthly" ? "toggle-btn active" : "toggle-btn"
          }
          onClick={() => setViewType("monthly")}
        >
          월별 요약
        </button>
        <button
          className={viewType === "daily" ? "toggle-btn active" : "toggle-btn"}
          onClick={() => setViewType("daily")}
        >
          일별 상세
        </button>
      </div>

      {/* 월별 요약 */}
      {viewType === "monthly" ? (
        monthlySummaries.length > 0 ? (
          <table className="weather-table">
            <thead>
              <tr>
                <th>연도</th>
                <th>월</th>
                <th>평균 기온(℃)</th>
                <th>추천 옷차림</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummaries.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.year}년</td>
                  <td>{d.month}월</td>
                  <td>{d.avg_temp}</td>
                  <td className="outfit">
                    {iconByOutfit(d.recommend_outfit)}
                    <span>{d.recommend_outfit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>선택한 연도의 월별 요약 데이터가 없습니다.</p>
        )
      ) : (
        /* 일별 상세 */
        <>
          <table className="weather-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>기온(℃)</th>
                <th>추천 옷차림</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((item, i) => (
                <tr key={i}>
                  <td>{item.date}</td>
                  <td>{item.avg_temp}</td>
                  <td className="outfit">
                    {iconByOutfit(item.recommend_outfit)}
                    <span>{item.recommend_outfit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            {monthlyAvg && (
              <tfoot>
                <tr>
                  <td>{selMonth}월 평균 기온</td>
                  <td>{monthlyAvg}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </>
        
      )}
      
    </div>
    
  );
}
