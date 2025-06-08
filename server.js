const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

// image
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json()); // ส่วนเพิ่มข้อมูล
app.use(cors());
app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "webfood",
});

//ดึงข้อมูล
app.get("/", (req, res) => {
  const sql = "SELECT * FROM product";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

//ดึงข้อมูล categories
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

// ดึง product ตาม category id
app.get("/products/:categoryId", (req, res) => {
  const categoryId = req.params.categoryId;
  let sql = `
    SELECT product.*, categories.name AS category_name
    FROM product 
    INNER JOIN categories ON product.categories_id = categories.id
  `;

  // ถ้าเลือกทั้งหมด (categoryId = 0 หรือว่าง) ให้ดึงทั้งหมด
  if (categoryId !== "0") {
    sql += " WHERE categories_id = ?";
  }

  db.query(sql, categoryId !== "0" ? [categoryId] : [], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    return res.json(data);
  });
});

// setup multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// create - upload image
app.post("/upload", upload.single("image"), (req, res) => {
  // เอาชื่อไฟล์ที่อัปโหลด
  const filename = req.file.filename;
  
  // บันทึกลงฐานข้อมูล
  db.query("INSERT INTO images (filename) VALUES (?)", [filename], (err) => {
    if (err) return res.json({ error: "บันทึกไม่ได้" });
    res.json({ filename });
  });
});

//get image filenames
app.get("/images", (req, res) => {
  const sql = "SELECT * FROM images";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

app.listen(8081, () => {
  console.log("listening");
});
