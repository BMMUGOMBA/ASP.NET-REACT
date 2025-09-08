import { useEffect, useState } from "react";
import {Typography} from '@mui/material'


function App() {

  const title = 'Welcome to Reactivities';
  const [activities, setActivities] = useState<Activity>([]);

  useEffect(() => {
    fetch('https://localhost:5001/api/activities')
    .then(response => response.json())
    .then(data => setActivities(data))

    return () => {

    }
  },[])
  

  return (
  <>
      <h3 className="app" style={{color:'red'}}>{title}</h3>
      <Typography variant='h3'>Reactivities</Typography>
      <ul>
        {activities.map((activity) => (
          //<li key={activity.id}>{activity.title}</li>
          <li key={activity.id}>{activity.title}</li>
        ))}
      </ul>
  </>
    
   
  )
}

export default App
