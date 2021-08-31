/*
 * @Descripttion: default
 * @version: 1.0.0
 * @Author: jiaxiantao
 * @Date: 2021-08-24 20:45:47
 * @LastEditors: jiaxiantao
 * @LastEditTime: 2021-08-27 11:49:52
 */
declare module '*.less';
declare module '*.png';
declare module '*.sass';

declare module '*.svg' {
    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement>
    >;
    const src: string;
    export default src;
}
