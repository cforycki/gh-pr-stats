import { Box, Container, Flex, Grid, GridItem, HStack, Heading, Spacer, VStack } from "@chakra-ui/react";
import { Config } from "./Config.jsx";
import { Data } from "./Data.jsx";
import { RunAnalyze } from "./RunAnalyze.jsx";
import { Sorting } from "./Sorting.jsx";
import { Summed } from "./Summed.jsx";
import { ColorModeButton } from "./ui/color-mode.jsx";

const AppBar = () => (
  <Container fluid={"true"} p={0}>
    <Box borderBottomWidth={1} borderBottomColor="muted" py={2} px={8}>
      <HStack>
        <Heading>Pull requests stats</Heading>
        <Spacer />
        <ColorModeButton />
      </HStack>
    </Box>
  </Container>
);

const Filters = () => {
  return (
    <Flex flexDirection="column" gap={4}>
      <Sorting />
      <Summed />
    </Flex>
  );
};

const MainContent = () => (
  <Container fluid={"true"} p={0} flexGrow={1} display="flex" overflow="hidden">
    <Grid container templateColumns="400px 1fr" templateRows="1fr" flexGrow={1}>
      <GridItem borderRightWidth={1} borderRightColor="muted" p={4} gap={8} display="flex" flexDirection="column">
        <Config />
        <RunAnalyze />
        <Filters />
      </GridItem>
      <GridItem overflow={"auto"}>
        <Data />
      </GridItem>
    </Grid>
  </Container>
);

export const App = () => (
  <VStack h={"100vh"} gap={0}>
    <AppBar />
    <MainContent />
  </VStack>
);
