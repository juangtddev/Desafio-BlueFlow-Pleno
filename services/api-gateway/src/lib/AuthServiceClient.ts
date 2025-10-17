import http from 'http';

interface UserPayload {
  id: number;
  email: string;
}

export class AuthServiceClient {
  private readonly authServiceUrl: string;

  constructor() {
    if (!process.env.AUTH_SERVICE_URL) {
      throw new Error('AUTH_SERVICE_URL is not defined');
    }
    this.authServiceUrl = process.env.AUTH_SERVICE_URL;
  }

  public async validateToken(token: string): Promise<UserPayload | null> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ token });
      const url = new URL(`${this.authServiceUrl}/validate-token`);

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        if (res.statusCode !== 200) {
          return resolve(null);
        }
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData.user as UserPayload);
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', (e) => {
        console.error(`Error calling auth-service: ${e.message}`);
        reject(e);
      });

      req.write(postData);
      req.end();
    });
  }
}
