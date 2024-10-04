const session = require("express-session");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.send(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    res.send(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_admin === 1) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          req.session.admin_id = userData._id;

          res.redirect("/admin/home");
        } else {
          res.render("login", { message: "Wrong Password" });
        }
      } else {
        res.render("login", { message: "No user found" });
      }
    } else {
      res.render("login", { message: "No user found" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id });
    res.render("home", { admin: userData });
  } catch (error) {
    res.send(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    res.send(error.message);
  }
};

const adminDashboard = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    const usersData = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    });

    res.render("dashboard", { users: usersData });
  } catch (error) {
    res.send(error.message);
  }
};

const newUserLoad = async (req, res) => {
  try {
    res.render("new-user");
  } catch (error) {
    res.send(error.messege);
  }
};

const addUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const image = req.file.filename;
    const password = req.body.password;

    const spassword = await securePassword(password);

    const user = new User({
      name: name,
      email: email,
      mobile: mobile,
      image: image,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("new-user", { message: "Something went Wrong" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    res.send(error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
        },
      }
    );

    res.redirect("/admin/dashboard");
  } catch (error) {
    res.send(error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    res.send(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  adminDashboard,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUser,
  deleteUser,
};
