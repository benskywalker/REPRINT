import React from 'react';
import { OverlayPanel } from "primereact/overlaypanel";
import '../styles/HelpPanel.css';

const HelpPanel = ({ op }) => {
  return (
    <>
      <i
        className="pi pi-question-circle help-icon"
        onClick={(e) => op.current.toggle(e)}
      />
      <OverlayPanel
        ref={op}
        appendTo={document.body}
        className="custom-overlay-panel bottom-right-overlay"
      >
        <div>
          <p>
            The Query Tool allows you to search for information in the database
            using a variety of parameters. You can search for information about
            people, organizations, places, religions, and documents.
          </p>
          <p>
            To use the Query Tool, select the type of information you want to
            search for from the dropdown menu. Then, add search parameters by
            selecting a field, operator, and value.
          </p>
        </div>
      </OverlayPanel>
    </>
  );
};

export default HelpPanel;