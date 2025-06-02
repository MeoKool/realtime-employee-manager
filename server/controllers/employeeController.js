// controllers/employeeController.js
const { db } = require("../services/firebase");
const { sendMail } = require("../services/emailService");
const EMPLOYEES_COLLECTION = process.env.EMPLOYEES_COLLECTION || "employees";

// POST /employee/create
// Body: { name, email, department, phoneNumber, role }
async function createEmployee(req, res, next) {
  try {
    const { name, email, department, phoneNumber, role } = req.body;
    if (!name || !email || !department) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Tạo document mới trong collection 'employees'
    const newDocRef = db.collection(EMPLOYEES_COLLECTION).doc();
    const employeeId = newDocRef.id;

    const newEmployee = {
      name,
      email,
      department,
      phoneNumber: phoneNumber || "",
      role: role || "employee",
      createdAt: Date.now(),
    };

    await newDocRef.set(newEmployee);

    // Gửi email chứa link để nhân viên tạo tài khoản
    // Giả sử bạn có route /employee/setup-account?eid=<employeeId>
    const setupLink = `${process.env.CLIENT_URL}/employee/setup-account?eid=${employeeId}`;
    const html = `
      <p>Chào ${name},</p>
      <p>Bạn được thêm vào hệ thống quản lý công việc. Vui lòng nhấp vào
      <a href="${setupLink}">đây</a> để tạo tài khoản lần đầu.</p>
      <p>Nếu không phải bạn thì hãy bỏ qua email này.</p>
    `;
    await sendMail(email, "Thiết lập tài khoản cho nhân viên mới", html);

    return res.status(201).json({ success: true, employeeId });
  } catch (err) {
    next(err);
  }
}

async function getAllEmployees(req, res) {
  try {
    const snapshot = await db.collection(EMPLOYEES_COLLECTION).get();

    if (snapshot.empty) {
      return res.status(200).json({ success: true, employees: [] });
    }

    const employees = [];
    snapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, employees });
  } catch (err) {
    console.error("Lỗi getAllEmployees:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
}
// POST /employee/get
// Body: { employeeId }
async function getEmployee(req, res, next) {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: "Missing employeeId" });
    }

    const docRef = db.collection(EMPLOYEES_COLLECTION).doc(employeeId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.status(200).json({ success: true, employee: docSnap.data() });
  } catch (err) {
    next(err);
  }
}

// POST /employee/delete
// Body: { employeeId }
async function deleteEmployee(req, res, next) {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: "Missing employeeId" });
    }

    await db.collection(EMPLOYEES_COLLECTION).doc(employeeId).delete();
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

// POST /employee/update
// Body: { employeeId, name?, email?, department?, phoneNumber?, role? }
async function updateEmployee(req, res, next) {
  try {
    const { employeeId, name, email, department, phoneNumber, role } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: "Missing employeeId" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (department) updateData.department = department;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (role) updateData.role = role;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const employeeRef = db.collection(EMPLOYEES_COLLECTION).doc(employeeId);
    const docSnap = await employeeRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await employeeRef.update(updateData);

    return res
      .status(200)
      .json({ success: true, message: "Employee updated successfully" });
  } catch (err) {
    console.error("Error updating employee:", err);
    next(err);
  }
}

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployee,
  deleteEmployee,
  updateEmployee,
};
