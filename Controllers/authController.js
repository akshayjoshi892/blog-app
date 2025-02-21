const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
   console.log("register");
   try {
      const handlePassword = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
         username: req.body.username,
         email: req.body.email,
         password: handlePassword,
         role: req.body.role,
      });

   
      await newUser.save();

      // Response to client
      res.status(200).json({
         message: "User created successfully",
         data: newUser,
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         message: "User creation failed",
         error: err,
      });
   }
};

const login = async (req, res) => {
   try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
         return res.status(404).json({
            message: "Username doesn't exist",
         });
      }
      const comparedPassword = await bcrypt.compare(
         req.body.password,
         user.password
      );

      if (!comparedPassword) {
         return res.status(404).json({
            message: "Username or password is incorrect",
         });
      }

      const token = jwt.sign(
         {
            userId: user._id,
            isAdmin: user.isAdmin,
            role: user.role,
         },
         process.env.JWT_KEY,
         {
            expiresIn: "5d",
         }
      );

  
      const { password, ...userData } = user._doc;


      res.status(200).json({
         message: "Login successful",
         user: { ...userData, token },
      });
   } catch (err) {
      console.log(err);
      res.status(500).json({
         message: "Login failed",
         error: err,
      });
   }
};

module.exports = {
   register,
   login,
};
