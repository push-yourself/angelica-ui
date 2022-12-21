/* eslint-disable @typescript-eslint/no-unused-vars */
import { AxiosResponse } from 'axios';
/* eslint-enable @typescript-eslint/no-unused-vars */

declare global {
    namespace API {
        // 在项目中为列表声明的类型
        interface ListType<T> {
            list: T[];
            page: ResponsePage;
        }
        // 列表时的分页参数
        interface ResponsePage {
            pageSize: number;
            pageNum: number;
            count: number;
            countPage: number;
        }
        // 请求时的参数信息
        interface PageInfo {
            pageNum?: number;
            pageSize?: number;
        }

        // axios 响应值
        interface WholeResponse<T> extends AxiosResponse {
            data: Response<T>;
        }

        // 后台返回的 response 值
        interface OriginalResponse<T> {
            code: number | string;
            msg: string;
            data: T;
            status: boolean;
        }

        // 处理后的 response 值
        interface Response<T> extends OriginalResponse<T> {
            type: string | undefined;
        }
    }
}
