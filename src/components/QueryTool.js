import React, { useState, useEffect } from "react";
import axios from "axios";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import "./QueryTool.css"; // Import the CSS file

const QueryTool = () => {
  const [data, setData] = useState({
    person: [],
    keyword: [],
    organizationtype: [],
    occupation: [],
    place: [],
    relationshiptype: [],
    religion: [],
    repositorie: [],
    role: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState({});
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [submittedTerms, setSubmittedTerms] = useState({});

  const apiEndpoint = "http://localhost:4000/base_query";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiEndpoint);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [apiEndpoint]);

  useEffect(() => {
    const filterData = () => {
      const term = searchTerm.toLowerCase ? searchTerm.toLowerCase() : "";
      const filtered = {
        person: data.person.filter((p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(term)
        ),
        keyword: data.keyword.filter((k) =>
          k.keyword.toLowerCase().includes(term)
        ),
        organizationtype: data.organizationtype.filter((o) =>
          o.organizationName.toLowerCase().includes(term)
        ),
        occupation: data.occupation.filter((o) =>
          (o.occupationDesc || "").toLowerCase().includes(term)
        ),
        place: data.place.filter((p) =>
          p.placeNameStd.toLowerCase().includes(term)
        ),
        relationshiptype: data.relationshiptype.filter((r) =>
          r.relationshipDesc.toLowerCase().includes(term)
        ),
        religion: data.religion.filter((r) =>
          r.religionDesc.toLowerCase().includes(term)
        ),
        repositorie: data.repositorie.filter((r) =>
          r.repoDesc.toLowerCase().includes(term)
        ),
        role: data.role.filter((r) => r.roleDesc.toLowerCase().includes(term)),
      };
      setFilteredData(filtered);
    };
    filterData();
  }, [searchTerm, data]);

  const searchSuggestions = (event) => {
    const query = event.query.toLowerCase();
    const allData = [
      ...data.person.map((p) => `${p.firstName} ${p.lastName}`),
      ...data.keyword.map((k) => k.keyword),
      ...data.organizationtype.map((o) => o.organizationName),
      ...data.occupation.map((o) => o.occupationDesc || ""),
      ...data.place.map((p) => p.placeNameStd),
      ...data.relationshiptype.map((r) => r.relationshipDesc),
      ...data.religion.map((r) => r.religionDesc),
      ...data.repositorie.map((r) => r.repoDesc),
      ...data.role.map((r) => r.roleDesc),
    ];
    setSuggestions(
      allData.filter((item) => item.toLowerCase().includes(query))
    );
  };

  const handleSubmit = () => {
    const categorizedTerms = {
      person: [],
      keyword: [],
      organizationtype: [],
      occupation: [],
      place: [],
      relationshiptype: [],
      religion: [],
      repositorie: [],
      role: [],
    };

    selectedTerms.forEach((term) => {
      if (data.person.some((p) => `${p.firstName} ${p.lastName}` === term)) {
        categorizedTerms.person.push(term);
      } else if (data.keyword.some((k) => k.keyword === term)) {
        categorizedTerms.keyword.push(term);
      } else if (
        data.organizationtype.some((o) => o.organizationName === term)
      ) {
        categorizedTerms.organizationtype.push(term);
      } else if (data.occupation.some((o) => o.occupationDesc === term)) {
        categorizedTerms.occupation.push(term);
      } else if (data.place.some((p) => p.placeNameStd === term)) {
        categorizedTerms.place.push(term);
      } else if (
        data.relationshiptype.some((r) => r.relationshipDesc === term)
      ) {
        categorizedTerms.relationshiptype.push(term);
      } else if (data.religion.some((r) => r.religionDesc === term)) {
        categorizedTerms.religion.push(term);
      } else if (data.repositorie.some((r) => r.repoDesc === term)) {
        categorizedTerms.repositorie.push(term);
      } else if (data.role.some((r) => r.roleDesc === term)) {
        categorizedTerms.role.push(term);
      }
    });

    setSubmittedTerms(categorizedTerms);
  };

  return (
    <div className="container">
      <AutoComplete
        value={searchTerm}
        suggestions={suggestions}
        multiple
        completeMethod={searchSuggestions}
        onChange={(e) => {
          setSearchTerm(e.value);
          setSelectedTerms(e.value);
        }}
        placeholder="Search..."
        classname="search"
        style={{ width: "30%" }}
        size={50}
        autoResize={false}
      />
      <Button label="Submit" onClick={handleSubmit} className="submit-button" />
      <div>
        <h3>Selected Terms:</h3>
        {Object.keys(submittedTerms).map((category) => (
          <div key={category}>
            <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            <ul>
              {submittedTerms[category].map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryTool;
