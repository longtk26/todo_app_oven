import jwt from 'jsonwebtoken';

const createAccessAndRefreshToken = (payload: any, secretKey: string) => {
  try {
    const accessToken = jwt.sign(payload, secretKey, {
      expiresIn: '1d',
    });

    const refreshToken = jwt.sign(payload, secretKey, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(
      `Error when creating access and refresh token: ${error.message}`,
    );
  }
};

const verifyAccessToken = (accessToken: string, secretKey: string) => {
  try {
    const decode = jwt.verify(accessToken, secretKey);
    return decode;
  } catch (error) {
    console.log(`Error when verifying access token: ${error.message}`);
  }
};

export { createAccessAndRefreshToken, verifyAccessToken };
