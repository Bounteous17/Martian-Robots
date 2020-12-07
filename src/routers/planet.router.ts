// Modules
import { Request, Response, Router } from 'express';

// Providers
import { planetProvider } from '../provider/planet.provider';
import { apiProvider } from '../provider/api.provider';

// Constants
const router: Router = Router();

/**
 * Add routing
 */
router.post('/', async (request: Request, response: Response) => {
    const message: Record<string, any> = await planetProvider.create(request);
    const { status, body } = apiProvider.getAppResponse(message);
    return response.status(status).send(body);
});

export default router;