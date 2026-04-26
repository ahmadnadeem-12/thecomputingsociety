
import React, { createContext, useContext, useState, useCallback } from "react";
import MajesticModal from "../components/ui/MajesticModal";

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    isConfirm: false,
    confirmText: "OK",
    cancelText: "CANCEL",
    onConfirm: null,
    onClose: null,
    content: null
  });

  const showAlert = useCallback((title, message, type = "info", confirmText = "OK") => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      isConfirm: false,
      confirmText,
      onConfirm: null,
      onClose: null,
    });
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, options = {}) => {
    const { 
      type = "warning", 
      confirmText = "CONFIRM", 
      cancelText = "CANCEL",
      onCancel = null,
      content = null
    } = options;

    setModal({
      isOpen: true,
      title,
      message,
      type,
      isConfirm: true,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setModal(prev => ({ ...prev, isOpen: false, content: null }));
      },
      onClose: () => {
        if (onCancel) onCancel();
        setModal(prev => ({ ...prev, isOpen: false, content: null }));
      },
      content
    });
  }, []);

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, closeModal }}>
      {children}
      <MajesticModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        isConfirm={modal.isConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onClose={modal.onClose || closeModal}
      >
        {modal.content}
      </MajesticModal>
    </ModalContext.Provider>
  );
};
