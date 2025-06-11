import {Router} from 'express';
import {authenticate} from '../middlewares/auth';
import multer from 'multer';
import multerS3 from 'multer-s3-v3';
import {s3} from '../config/aws';
import {validate} from '../middlewares/validate';
import {
    postParamsSchema,
    createPostSchema,
    updatePostSchema, GetPhotos, getPhotosSchema,
} from '../schemas/post';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost, getAllFiles,
} from '../controllers/postController';
import {config} from "../config/config";
import { getPostsSchema } from '../schemas/post';

console.log('Bucket name:', config.S3_BUCKET_NAME);


const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET_NAME!,
        acl: 'public-read',
        // Для любого файла мы просто пробрасываем реальный MIME-тип:
        contentType: (req, file, cb) => {
            cb(null, file.mimetype);
        },
        // Если вы хотите, чтобы PDF отображался в браузере, а остальные (например, docx)
        // предлагались скачать — можно динамически выставлять Content-Disposition:
        contentDisposition: (req, file, cb) => {
            // Пример: если document (PDF, DOCX, XLSX и т.п.), делаем attachment;
            // если изображение — inline
            const mime = file.mimetype.toLowerCase();
            if (mime === 'application/pdf' || mime.endsWith('msword') || mime.includes('officedocument')) {
                // PDF и офисные файлы: скачивать
                cb(null, 'attachment');
            } else if (mime.startsWith('image/')) {
                // Изображения: показывать в браузере
                cb(null, 'inline');
            } else {
                // Всё остальное — скачивать
                cb(null, 'attachment');
            }
        },
        key: (_, file, cb) => {
            // Генерируем уникальное имя
            const timestamp = Date.now();
            // Можно сохранить в папке «uploads/» с оригинальным именем
            cb(null, `uploads/${timestamp}_${file.originalname}`);
        },
    }),
    limits: {
        fileSize: 50 * 1024 * 1024, // например, ограничение на 50 МБ (настраивайте по потребности)
    },
    // Здесь нет fileFilter — значит принимаем любые mimetype
});

const router = Router();

router.post(
    '/api/v1/posts',
    authenticate,
    upload.array('files', 10), // поле multipart/form-data будет называться files[]
    validate(createPostSchema),
    createPost
);

router.get(
    '/api/v1/posts',
    validate(getPostsSchema),
    getAllPosts
);

router.get(
    '/api/v1/posts/photos',
    validate(getPhotosSchema),
    getAllFiles
);


router.get(
    '/api/v1/posts/:id',
    validate(postParamsSchema),
    getPostById
);

router.patch(
    '/api/v1/posts/:id',
    authenticate,
    upload.array('files', 10),
    validate(updatePostSchema),
    updatePost
);

router.delete(
    '/api/v1/posts/:id',
    authenticate,
    validate(postParamsSchema),
    deletePost
);

export default router;
