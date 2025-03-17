import bcrypt from 'bcryptjs';

const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(`Error hash password: ${error.message}`);
  }
};

const comparePassword = async (password: string, hashedPassword: string) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.log(`Error compare password: ${error.message}`);
  }
};

export { hashPassword, comparePassword };
