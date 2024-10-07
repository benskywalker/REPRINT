import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import './QueryTool.css';
import { TabView, TabPanel } from "primereact/tabview";
import { SplitButton } from "primereact/splitbutton";
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Slider } from "primereact/slider";
import { OverlayPanel } from "primereact/overlaypanel"; // Import OverlayPanel

const QueryTool2 = ()=> {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [value, setValue] = useState([20,80]);
    const op = useRef(null);     //OverlayPanel reference

    const countries = [
        { name: 'United States', code: 'US' },
        { name: 'Canada', code: 'CA' },
        { name: 'United Kingdom', code: 'UK' },
        { name: 'Australia', code: 'AU' },
        { name: 'Germany', code: 'DE' }
    ];
    
    const selectedCountryTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <img alt={option.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };
    
    const countryOptionTemplate = (option) => {
        return (
            <div className="country-item">
                <span>{option.name}</span>
            </div>
        );
    };

    
    return (
        <div className="query-tool-container">
            <div className="title-container">
                <h1>Query Tool</h1>
            </div>
            <div className="query-container">
                <TabView className="query-tool">
                    <TabPanel header="Query" leftIcon="pi pi-search mr-2">
                        <div className="query-section">
                            <h3>Search for:</h3>
                            <Dropdown tooltip="Message to display" value={selectedCountry} onChange={(e) => setSelectedCountry(e.value)} options={countries} optionLabel="name" placeholder="Select a Country" 
                            filter valueTemplate={selectedCountryTemplate} itemTemplate={countryOptionTemplate} className="w-full md:w-14rem" />
                        </div>
                        <div className="query-section">
                            <h3>And where:</h3>
                            <div className="query-input">
                                <Dropdown tooltip="Message to display" value={selectedCountry} onChange={(e) => setSelectedCountry(e.value)} options={countries} optionLabel="name" placeholder="Select a Country" 
                                filter valueTemplate={selectedCountryTemplate} itemTemplate={countryOptionTemplate} className="w-full md:w-14rem" />
                                <SplitButton label="Save" icon="pi pi-plus" />
                                <FloatLabel>
                                    <InputText id="username"/>
                                    <label htmlFor="username">Username</label>
                                </FloatLabel>
                                <SplitButton label="Save" icon="pi pi-plus" />

                            </div>
                        
                        </div>
                        <div className="query-section">
                            <h3>And where:</h3>
                            <div className="query-input">
                                <Dropdown tooltip="Message to display" value={selectedCountry} onChange={(e) => setSelectedCountry(e.value)} options={countries} optionLabel="name" placeholder="Select a Country" 
                                filter valueTemplate={selectedCountryTemplate} itemTemplate={countryOptionTemplate} className="w-full md:w-14rem" />

                                <SplitButton label="Save" icon="pi pi-plus" />

                            </div>
                        
                        </div>
                        <div className="slider-container">
                            <Slider value={value} onChange={(e) => setValue(e.value)} className="slider" range={true} style={{ width: '50%' }} tooltip="Message to display" />
                          {/* Help Icon with click event */}
                          <i className="pi pi-question-circle help-icon" onClick={(e) => op.current.toggle(e)}></i>
                            
                            {/* OverlayPanel Component */}
                            <OverlayPanel ref={op} appendTo={document.body} className="custom-overlay-panel">
                                <div>
                                    <p>This is the help panel where you can provide additional information about how to use the slider.</p>
                                </div>
                            </OverlayPanel>
                        </div>
                        
                        
                    </TabPanel>
                    <TabPanel header="Network" leftIcon="pi pi-user mr-2">
                        <p className="m-0">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
                            eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
                            enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui 
                            ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                        </p>
                    </TabPanel>
                    <TabPanel header="Map" leftIcon="pi pi-map-marker mr-2">
                        <p className="m-0">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
                            eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
                            enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui 
                            ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                        </p>
                    </TabPanel>
                    <TabPanel header="Table" leftIcon="pi pi-table mr-2" >
                        <p className="m-0">
                            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti 
                            quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
                            culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. 
                            Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                        </p>
                    </TabPanel>
                </TabView>            
            </div>
        </div>

    );
}

export default QueryTool2;