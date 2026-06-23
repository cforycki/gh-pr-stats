import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { analyze } from "../core/analyze.js";
import { fetchData } from "../core/fetchData.js";
import {
  apiKeyState,
  dataState,
  endDateState,
  organizationState,
  rawDataState,
  repositoriesState,
  startDateState,
  teamMembersState,
} from "../state.js";
import { Button } from "./ui/button.jsx";

export const RunAnalyze = () => {
  const apiKey = useAtomValue(apiKeyState);
  const organization = useAtomValue(organizationState);
  const startDate = useAtomValue(startDateState);
  const endDate = useAtomValue(endDateState);
  const repositoriesRaw = useAtomValue(repositoriesState);
  const [loading, setLoading] = useState(false);
  const disabled = !apiKey || !organization;
  const [, setData] = useAtom(dataState);
  const [, setRawData] = useAtom(rawDataState);
  const [, setTeamMembers] = useAtom(teamMembersState);

  const repositories = repositoriesRaw.split(/[,; ]/);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data: result, teamMembers } = await fetchData({
        apiKey,
        organization,
        startDate,
        endDate,
        repositories,
      });
      setRawData(result);
      setTeamMembers(teamMembers);
      const analyzed = await analyze({
        data: result,
        teamMembers,
        repositories,
      });
      setData(analyzed);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button colorPalette={"teal"} disabled={disabled} loading={loading} onClick={handleClick}>
      Analyze
    </Button>
  );
};
