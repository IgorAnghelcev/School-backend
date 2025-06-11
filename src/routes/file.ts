import {authenticate} from "../middlewares/auth";
import {validate} from "../middlewares/validate";
import router from "./post";
import {fileSchema} from "../schemas/file";
import {deleteFile} from "../controllers/fileController";

router.delete(
    '/api/v1/files/:id',
    authenticate,
    validate(fileSchema),
    deleteFile
);
export default router;
