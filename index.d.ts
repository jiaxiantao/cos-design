/*
 * @Descripttion: default
 * @version: 1.0.0
 * @Author: jiaxiantao
 * @Date: 2021-08-24 20:45:47
 * @LastEditors: jiaxiantao
 * @LastEditTime: 2021-09-06 20:08:33
 */
declare module '*.less';
declare module '*.png';
declare module '*.jpg';
declare module '*.sass';

declare module '*.svg' {
    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement>
    >;
    const src: string;
    export default src;
}
