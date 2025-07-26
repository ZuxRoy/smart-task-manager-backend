import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { userValidation, loginValidation } from '../utils/validation';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = userValidation.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }

      const existingUser = await User.findOne({
        $or: [{ email: value.email }, { username: value.username }]
      });

      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const user = new User(value);
      await user.save();

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginValidation.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }

      const user = await User.findOne({ email: value.email });
      if (!user || !(await user.comparePassword(value.password))) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
}

