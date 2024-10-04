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

const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    res.send(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      image: req.file.filename,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();

    if (userData) {
      res.render("registration", {
        message: "Your registration has been successfull!!",
      });
    } else {
      res.render("registration", {
        message: "Your registration has been failed",
      });
    }
  } catch (error) {
    res.send(error.message);
  }
};

//login

const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    res.send(error.message);
  }
};

const veriyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        req.session.user_id = userData._id;
        res.redirect("/home");
      } else {
        res.render("login", { message: "Wrong Password" });
      }
    } else {
      res.render("login", { message: "No user found" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    res.render("home", { user: userData });
  } catch (error) {
    res.send(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    res.send(error.message);
  }
};

const editProfile = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });

    if (userData) {
      res.render("edit", { user: userData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    res.send(error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file.filename,
          },
        }
      );
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
          },
        }
      );
    }

    res.redirect("/home");
  } catch (error) {
    res.send(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  veriyLogin,
  loadHome,
  userLogout,
  editProfile,
  updateProfile,
};
