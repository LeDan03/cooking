import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function CustomBarChart({ dataList, year, labelPrefix = "Tháng", chartName = "" }) {
  const isWeekly = labelPrefix.toLowerCase() === "tuần";
  const itemsPerPage = isWeekly ? 13 : dataList.length;
  const totalPages = isWeekly ? Math.ceil(dataList.length / itemsPerPage) : 1;

  // Tính tuần hiện tại
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // lấy ngày 1(0: js tính 0->11) tháng 1

  //today - firstDayOfYear → số mili-giây từ 01-01 đến hôm nay.
  //Chia cho 1000 * 60 * 60 * 24 → chuyển mili-giây thành số ngày. 
  //Math floor là làm tròn xuống
  //Kết quả: tổng số ngày đã trôi qua trong năm tính cả hôm nay.
  const daysPassed = Math.floor((today - firstDayOfYear) / (1000 * 60 * 60 * 24)) + 1;
  const currentWeek = Math.ceil(daysPassed / 7);

  // Trang mặc định chứa tuần hiện tại
  const defaultPage = isWeekly ? Math.floor((currentWeek - 1) / itemsPerPage) : 0;
  const [page, setPage] = useState(defaultPage);

  const pagedData = dataList
    .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
    .map((value, index) => {
      const actualIndex = page * itemsPerPage + index;
      return {
        name: `${labelPrefix} ${actualIndex + 1}`,
        value,
        isCurrent: actualIndex + 1 === currentWeek, //  đánh dấu tuần hiện tại
      };
    });

  // tính khoảng thời gian của trang (nếu là tuần)
  const getDateRangeForPage = () => {
    if (!isWeekly) return null;

    const startWeek = page * itemsPerPage + 1;
    const endWeek = Math.min((page + 1) * itemsPerPage, dataList.length);

    const startDate = new Date(year, 0, 1 + (startWeek - 1) * 7);
    const endDate = new Date(year, 0, 1 + (endWeek * 7) - 1);

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${date.getFullYear()}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Custom Tick để in đậm tuần hiện tại
  const CustomXAxisTick = ({ x, y, payload }) => {
    const item = pagedData.find(d => d.name === payload.value);
    const isCurrent = item?.isCurrent;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#333"
          fontWeight={isCurrent ? "bold" : "normal"}
          style={{ fontSize: 14 }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4">
        {chartName} {year}
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={pagedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={<CustomXAxisTick />} />
          <YAxis
            allowDecimals={false}
            domain={[0, (dataMax) => Math.ceil(dataMax)]}
          />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {pagedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isCurrent ? "#f59e0b" : "#3b82f6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/*  Hiển thị khoảng thời gian nếu là tuần */}
      {isWeekly && (
        <div className="flex w-full items-center justify-center mt-2">
          <p><strong>{getDateRangeForPage()}</strong></p>
        </div>
      )}

      {/*  Điều khiển phân trang nếu là biểu đồ tuần */}
      {isWeekly && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Trang trước
          </button>
          <span>Trang {page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
