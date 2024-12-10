import { userModel } from "../../../database/models/user.model.js";
import { catchError } from "../../utils/catchError.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from "bcrypt";
import generateTokens from "../../utils/generateToken.js";
import verifyToken from "../../utils/verifyToken.js";

const signUp = catchError(async (req, res, next) => {
  let isUser = await userModel.findOne({ email: req.body.email });
  if (isUser) return next(new AppError("Account already exists", 409));
  const user = new userModel(req.body);
  await user.save();

  // Created
  res.status(201).json({ message: "success", user });
});



const signIn = catchError(async (req, res, next) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password))
    return next(new AppError("Incorrect email or password", 409));
// create accessToken and refreshToken
  const tokens = generateTokens({
    name: user.name,
    email: user.email,
    id: user._id,
    role: user.role,
  });

  // Save refresh token in the database
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.status(200).json({ message: "success", tokens });
});






const refreshToken = catchError(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return next(new AppError("Refresh token is missing", 400));

  // Verify refresh token
  let decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SIGNATURE)
    if (!decoded) return next(new AppError("Invalid refresh token", 401));
  
    
 
    // Check if the refresh token matches the one in the database
    const user = await userModel.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken)
      return next(new AppError("Invalid or expired refresh token", 401));

   // Generate new tokens (access and refresh tokens)
  const tokens = generateTokens({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
    res.status(200).json({ message: "success", tokens });
  });

  

// 1- check we have token or not 
// 2- verfy token
// 3 if user of this token exist or not 
// 4- check if this token is the last one or not (change password )




//  authentication
// const protectRoutes=catchError(async(req,res,next)=>{
//   const { authorization } = req.headers;
//   if (!authorization?.startsWith(process.env.BEARER_KEY)) {
//     return next(new AppError("Invalid Bearer Key", 400)); 
// }
// const token = authorization.split(process.env.BEARER_KEY)[1]?.trim()
// if (!token) {
//     return next(new AppError("Invalid token format", 401));
// }

//   if (!token) return next(new AppError("please provide token", 401))
  
//   let decoded = await jwt.verify(token, process.env.TOKEN_SIGNATURE);
// console.log(decoded)
 
// let user = await userModel.findById(decoded.id)
// if (!user) return next(new AppError("User not found", 404));

// if (user.changePasswordAt) {
//     let changePasswordTime = parseInt(user.changePasswordAt.getTime() / 1000);
//       console.log(changePasswordTime,"==========",decoded.iat)

//     if (changePasswordTime > decoded.iat) 
//       return next(new AppError("  token invalid", 401));

// }


// req.user = user;
// next()
// })

 
// autherization 
//  admin or user can access 
// const allowedto = (...roles) => {
//   // ['admin','user'] b4of mokod wla laa
//   return catchError(async (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(new AppError("You are not authorized to access this route. Your role is " + req.user.role, 401));
//     }

//     // User has the required role, continue to the next middleware or route handler
//     next();
//   });
// };
export {
   signUp,
    signIn,
        refreshToken
  //  protectRoutes,
  //  allowedto
   };
 