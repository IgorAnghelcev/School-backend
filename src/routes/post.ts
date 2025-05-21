import {Router} from 'express';
import {authenticate} from '../middlewares/auth';
import multer from 'multer';
import multerS3 from 'multer-s3-v3';
import {s3} from '../config/aws';
import {validate} from '../middlewares/validate';
import {
    postParamsSchema,
    createPostSchema,
    updatePostSchema,
} from '../schemas/post';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
} from '../controllers/postController';
import {config} from "../config/config";
import { getPostsSchema } from '../schemas/post';

console.log('Bucket name:', config.S3_BUCKET_NAME);

const upload = multer({
    storage: multerS3({
        s3,
        bucket: config.S3_BUCKET_NAME!,
        acl: 'public-read',
        contentType: (req, file, cb) => {
            cb(null, file.mimetype);
        },
        contentDisposition: (req, file, cb) => {
            cb(null, 'inline');    // <— это заставит браузер отображать картинку, а не скачивать
        },
        key: (_, file, cb) => {
            cb(null, `posts/${Date.now()}_${file.originalname}`);
        },
    }),
});

const router = Router();

router.post(
    '/api/v1/posts',
    authenticate,
    upload.array('photos', 10), // multipart/form-data с полем photos[]
    validate(createPostSchema),
    createPost
);


router.get(
    '/api/v1/posts',
    validate(getPostsSchema),
    getAllPosts
);

router.get(
    '/api/v1/posts/:id',
    validate(postParamsSchema),
    getPostById
);

router.patch(
    '/api/v1/posts/:id',
    authenticate,
    upload.array('photos', 10),
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
