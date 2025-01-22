import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { boolItems, actionItems, firstActionItems } from '../Constants';
import '../styles/QuerySection.css';

const QuerySection = ({ 
  section, 
  index, 
  filteredFields, 
  sections, 
  setSections, 
  addNewSection, 
  removeSection 
}) => {
  return (
    <div className="query-section">
      <h3>Where:</h3>
      <div className="query-input">
        <Dropdown
          tooltip="Select a field to search within"
          value={section.selectedField}
          onChange={(e) => {
            const newSections = [...sections];
            newSections[index].selectedField = e.value;
            setSections(newSections);
          }}
          options={filteredFields}
          optionLabel="field"
          placeholder="Parameters"
          filter
          className="w-full md:w-14rem"
          disabled={filteredFields?.length === 0}
        />
        <Dropdown
          tooltip="Select an operator"
          value={section.selectedParameter}
          onChange={(e) => {
            const newSections = [...sections];
            newSections[index].selectedParameter = e.value;
            setSections(newSections);
          }}
          options={boolItems}
          optionLabel="label"
          placeholder="Parameters"
          className="w-full md:w-14rem"
        />
        <FloatLabel>
          <InputText
            tooltip="Enter a value"
            value={section.selectedValue}
            onChange={(e) => {
              const newSections = [...sections];
              newSections[index].selectedValue = e.target.value;
              setSections(newSections);
            }}
          />
          <label htmlFor="username">Value</label>
        </FloatLabel>
        <Dropdown
          tooltip="(Optional)"
          value={section.selectedAction}
          onChange={(e) => {
            const newSections = [...sections];
            newSections[index].selectedAction = e.value;
            setSections(newSections);
            if (
              index === newSections.length - 1 &&
              (e.value === "and" || e.value === "or")
            ) {
              addNewSection();
            } else if (e.value === "remove") {
              if (index === newSections.length - 1) {
                sections[index - 1].selectedAction = null;
              }
              removeSection(section.id);
            }
          }}
          options={index !== 0 ? actionItems : firstActionItems}
          optionLabel="label"
          placeholder="Select Action"
          className="w-full md:w-14rem"
        />
      </div>
    </div>
  );
};

export default QuerySection;