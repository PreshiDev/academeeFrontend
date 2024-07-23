import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const SubScreenLayout = () => {

  return (
    <>
      <Stack>
        <Stack.Screen
          name="school-calendars"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="video-details"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="days"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Enote"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="allNews"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="newsDetail"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="classNote"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="assemblyTopics"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="examQuestions"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="examTimetable"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="reportComments"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="schoolActivities"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sheetTemplates"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="workBook"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      
      <StatusBar backgroundColor="#D3D3D3" />
    </>
  );
};

export default SubScreenLayout;