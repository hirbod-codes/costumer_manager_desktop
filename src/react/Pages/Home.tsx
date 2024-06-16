import { useContext, useState, useEffect } from "react";
import { ConfigurationContext } from "../ConfigurationContext";
import { fromDateTime, fromDateTimePartsToFormat, DATE } from "../Lib/DateTime/date-time-helpers";
import { DateTime } from "luxon";
import { t } from "i18next";
import { Box, Button, CircularProgress, Grid, TextField } from "@mui/material";
import { number } from "yup";
import { CostumerTable } from "../Components/Costumer/CostumerTable";

export function Home() {
    const configuration = useContext(ConfigurationContext);

    const today = fromDateTime(configuration.get.locale, 'Gregorian', DateTime.utc())

    const [year, setYear] = useState<number | null>(today.date.year);
    const [month, setMonth] = useState<number | null>(today.date.month);
    const [day, setDay] = useState<number | null>(today.date.day);
    const [gridDate, setGridDate] = useState<string>('')

    const goToToday = async () => {
        const today = fromDateTime(configuration.get.locale, 'Gregorian', DateTime.utc());

        setYear(today.date.year);
        setMonth(today.date.month);
        setDay(today.date.day);
    };

    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (Number(year) < 1) return;
        if (Number(month) < 1 || Number(month) > 12) return;
        if (Number(day) < 1 || Number(day) > 31) return;

        setIsLoading(true)
        try { setGridDate(fromDateTimePartsToFormat({ ...configuration.get.locale, calendar: 'Gregorian', zone: 'UTC' }, configuration.get.locale, { year, month, day }, undefined, DATE)) }
        finally { setIsLoading(false) }
    }, [year, month, day])

    return (
        <>
            <Grid container spacing={1}>
                <Grid item sm={4} xs={6}>
                    <TextField label={t('year')} variant="standard" value={year ?? 0} fullWidth error={year === null} helperText={year !== null ? '' : t('invalid-year')} onChange={(e) => {
                        if (!number().required().min(1).isValidSync(e.target.value))
                            setYear(null)
                        else
                            setYear(Number(e.target.value))
                    }} />
                </Grid>
                <Grid item sm={4} xs={6}>
                    <TextField label={t('month')} variant="standard" value={month ?? 0} fullWidth error={month === null} helperText={month !== null ? '' : t('invalid-month')} onChange={(e) => {
                        if (!number().required().min(1).max(12).isValidSync(e.target.value))
                            setMonth(null)
                        else
                            setMonth(Number(e.target.value))
                    }} />
                </Grid>
                <Grid item sm={4} xs={6}>
                    <TextField label={t('day')} variant="standard" value={day ?? 0} fullWidth error={day === null} helperText={day !== null ? '' : t('invalid-day')} onChange={(e) => {
                        if (!number().required().min(1).max(31).isValidSync(e.target.value))
                            setDay(null)
                        else
                            setDay(Number(e.target.value))
                    }} />
                </Grid>
                <Grid item xs={'auto'} >
                    <Button onClick={goToToday}>{t('today')}</Button>
                </Grid>

                <Grid item xs={12} />

                <Grid item container justifyContent={'center'} xs={12}>
                    {isLoading
                        ? <CircularProgress />
                        :
                        <Box sx={{ height: '70vh', width: '100%', p: 2 }}>
                            <CostumerTable gridDate={gridDate} />
                        </Box>
                    }
                </Grid>
            </Grid>
        </>
    )
}
