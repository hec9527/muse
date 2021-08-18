import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Modal, { ModalProps } from './modal';

export default function show(config: ModalProps) {
  const el = document.createElement('div');
  document.body.appendChild(el);

  const show = (config: ModalProps) => {
    render(
      <Modal
        {...config}
        onCancel={() => {
          config.onCancel?.();
          close();
        }}
      />,
      el
    );
  };

  const close = () => {
    unmountComponentAtNode(el);
    try {
      document.body.removeChild(el);
    } catch (error) {}
  };

  show({
    ...config,
    visible: false,
  });

  setTimeout(() => show({ ...config }), 1);

  return { close };
}
