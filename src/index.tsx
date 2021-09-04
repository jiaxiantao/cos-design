/*
 * @Descripttion: default
 * @version: 1.0.0
 * @Author: jiaxiantao
 * @Date: 2021-08-24 10:28:57
 * @LastEditors: jiaxiantao
 * @LastEditTime: 2021-09-03 14:57:46
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as AllComponents from './components';
const { CanvasClock } = AllComponents;

ReactDOM.render(
  <div>
    <div>hello,cos-deisgn！</div>
    <CanvasClock />
  </div>,
  document.getElementById('root')
);

export * from './components';
