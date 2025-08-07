import React, { useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend } from "recharts";
import Chart from "./Chart";
import "./TotalBox.css"; 

function TotalBox({ onFilteredData }) {
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); 
  const [totalSpending, setTotalSpending] = useState(0);
  const [categorySpending, setCategorySpending] = useState(0);
  const [filteredData, setFilteredData] = useState([]);

  const searchRef = useRef();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4444"];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("journalData"));

    if (!stored || stored.length === 0) {
      // fetch data from public/spending_data.json
      fetch("/spending_data.json")
        .then((res) => res.json())
        .then((dummyData) => {

          const formattedData = dummyData.map((item, idx) => ({
            id: idx + 1,
            description: item.description,
            category: item.category,
            amount: Number(item.amount),
            date: item.date
          }));

          localStorage.setItem("journalData", JSON.stringify(formattedData));
          setRecords(formattedData);
          setFilteredData(formattedData);

          const uniqueCats = [...new Set(formattedData.map((rec) => rec.category).filter(Boolean))];
          setCategories(uniqueCats);

          const total = formattedData.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);
          setTotalSpending(total);
        })
        .catch((err) => console.error("Error loading dummy data:", err));
    } else {
      const sorted = [...stored].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(sorted);
      setFilteredData(sorted);

      const uniqueCats = [...new Set(stored.map((rec) => rec.category).filter(Boolean))];
      setCategories(uniqueCats);

      const total = stored.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);
      setTotalSpending(total);
    }
  }, []);


  useEffect(() => {
    let filtered = [...records];

    if (selectedCategory) {
      filtered = filtered.filter((rec) => rec.category === selectedCategory);
    }
    if (selectedMonth) {
      filtered = filtered.filter((rec) => rec.date.startsWith(selectedMonth));
    }

    setFilteredData(filtered);

    const totalCat = filtered.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);
    setCategorySpending(totalCat);

    // send filtered data to LineChart for monthly view
    if (onFilteredData) {
      onFilteredData(filtered);
    }
  }, [selectedCategory, selectedMonth, records]);

  const handleSearch = () => {
    const keyword = searchRef.current.value.toLowerCase();
    const filtered = records.filter(
      (item) =>
        item.description.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
    );
    setFilteredData(filtered);
  };

  const sortByDateAsc = () => {
    const sorted = [...filteredData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setFilteredData(sorted);
  };

  const sortByDateDesc = () => {
    const sorted = [...filteredData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setFilteredData(sorted);
  };

  const handleDelete = (id) => {
    const updated = records.filter((item) => item.id !== id);
    setRecords(updated);
    setFilteredData(updated);
    localStorage.setItem("journalData", JSON.stringify(updated));

    const total = updated.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);
    setTotalSpending(total);
  };

  // get months from data
  const uniqueMonths = [
    ...new Set(records.map((rec) => rec.date.slice(0, 7))) // YYYY-MM format
  ];

  // pie chart data for selected month
  const pieData = categories.map((cat) => {
    const total = filteredData
      .filter((item) => item.category === cat)
      .reduce((sum, rec) => sum + Number(rec.amount), 0);
    return { name: cat, value: total };
  }).filter((item) => item.value > 0);

  return (
    <>
      <div className="box">
        <div className="totalBox">
          <h3 className="title">Spending Summary (Filtered by Month & Category)</h3>

          {/* month dropdown */}
          <div className="dropdown-container" style={{ marginBottom: "10px" }}>
            <label htmlFor="monthDropdown" className="dropdown-label">
              Select Month:
            </label>
            <select
              id="monthDropdown"
              className="category-dropdown"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {uniqueMonths.map((month, idx) => (
                <option key={idx} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* category dropdown */}
          <div className="dropdown-container">
            <label htmlFor="categoryDropdown" className="dropdown-label">
              Select Category:
            </label>
            <select
              id="categoryDropdown"
              className="category-dropdown"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="summary-container">
            <p>
              <strong>Total Spending:</strong> Baht {totalSpending.toFixed(2)}
            </p>
            {(selectedCategory || selectedMonth) && (
              <p>
                <strong>Filtered Spending:</strong> Baht {categorySpending.toFixed(2)}
              </p>
            )}
          </div>

          {/* search and sort */}
          <div style={{ marginTop: "15px", marginBottom: "10px" }}>
            <input type="text" placeholder="Search..." ref={searchRef} />
            <Button onClick={handleSearch} variant="contained" size="small" style={{ marginLeft: "10px" }}>
              Search
            </Button>
            &nbsp;&nbsp; Sort by Date:
            <Button onClick={sortByDateAsc}>🔼</Button>
            <Button onClick={sortByDateDesc}>🔽</Button>
          </div>

          {/* data table */}
          <table border="1" width="100%" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr>
                <th></th>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>{item.date}</td>
                    <td>Baht {Number(item.amount).toFixed(2)}</td>
                    <td>
                      <Button color="error" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pie chart */}
        {pieData.length > 0 && (
          <div className="pie-chart" style={{ width: "100%", height: 250, marginTop: "15px" }}>
            <PieChart width={400} height={250}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </div>
        )}
      </div>

      {/* Show Chart only if a specific month is selected */}
      {selectedMonth && (
        <Chart className="line-Chart" filteredData={filteredData} selectedMonth={selectedMonth} />
      )}
    </>
  );
}

export default TotalBox;
