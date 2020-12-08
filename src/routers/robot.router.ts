// Modules
import { Request, Response, Router } from 'express';

// Providers
import { apiProvider } from '../provider/api.provider';
import { robotProvider } from '../provider/robot.provider';

// Constants
const router: Router = Router();

/**
 * Add routing
 */
router.post('/', async (request: Request, response: Response) => {
    const message: Record<string, any> = await robotProvider.create(request);
    const { status, body } = apiProvider.getAppResponse(message);
    return response.status(status).send(body);
});

export default router;