import urllib2
import pandas as pd
import numpy as np
import json
import time
import re
import StringIO
import matplotlib.pyplot as plt


class USGSdata(object):
    '''
    A Class to interface to the USGS data bases via RESTlike interface. Data is output as a pandas data frame 
    '''
    stat_cd = {'Maximum Values':"00001",
                'Minimum Values':"00002",
                'Mean Values':"00003",
                'AM Values':"00004",
                'PM Values':"00005",
                'Summation Values':"00006",
                'Modal Values':"00007",
                'Median Values':"00008",
                'Standard Deviation Values':"00009",
                'Variance Values':"00010"}
    
    def __init__(self):
        ''' 
        Build the initial object for interfacing
        '''
        self.restPath  = "http://waterservices.usgs.gov/nwis/site/?"
        self.dataPath = "http://waterservices.usgs.gov/nwis/dv/?"
        
        # Build list of counties
        data = pd.read_csv('fips_codes_website.csv',header=0)
        countyIdx = data['Entity Description'] == 'County'
        countyData = data.ix[countyIdx]
        countyDataDF = countyData.drop('Entity Description',axis=1)
        # Re-index data from 0 after non-county drop
        idx = range(0,len(countyDataDF))
        countyDataDF.index = idx    
        
        # Build the state index
        stateCode = 'State FIPS Code'
        countyFIPS = 'County FIPS Code'
        # Recover the state codes from the first column
        states =  countyDataDF['State Abbreviation'].unique()
        stateCodes = countyDataDF['State FIPS Code'].unique()
        
        # Make a States dictionary
        self.stateCodes = {}
        for st, cd in zip(states, stateCodes):
            self.stateCodes[st] = cd
        
        # Generate the FIPS County Code for each County
        countyCodes = []
        for index, row in countyDataDF.iterrows():
            countyCodes.append("%02d%03d"%(self.stateCodes[row['State Abbreviation']],
                                                             row['County FIPS Code']))
        countryCodesDF = pd.DataFrame(countyCodes,columns=['USGS County Codes'])
        self.countyData = pd.concat([countyDataDF,countryCodesDF], join='inner', axis=1)
        
    def getCountySites(self,countyIDs, format = 'rdb'):
        ''' Takes a county ID code a fetches information for the county's Sites.'''
        # Build the REST arguments
        # County
        countySTR = [str(cty) for cty in countyIDs]
        countryArg = "countyCd="+','.join(countySTR)
        # Format 
        if format:
            formatArg = "format="+format
        else:
            formatArg = "format=rdb"

        # REST Argument
        arg = "&".join([countryArg,formatArg])
        RESTrequest = self.restPath + arg
        print RESTrequest
        # contact services
        dataDF = pd.read_table(RESTrequest,
                            delimiter='\t',
                            comment  ='#')

    def getCountyStatisticsData(self,countyID, stat_cd = '00001', startDT='2010-11-22', endDT='2014-11-22'):
        ''' 
        Get the Water Data for the specified county as specified by the county's 5 digit FIPS ID. Statistics stat_cd codes are:
            'Maximum Values':"00001",
            'Minimum Values':"00002",
            'Mean Values':"00003",
            'AM Values':"00004",
            'PM Values':"00005",
            'Summation Values':"00006",
            'Modal Values':"00007",
            'Median Values':"00008",
            'Standard Deviation Values':"00009",
            'Variance Values':"00010"
        
            Further documentation available at:     http://waterservices.usgs.gov/rest/DV-Service.html#format

        '''
        # Build the REST arguments
        # County
        countyArg = "countyCd="+','.join(countyID)
        # Format 
        formatArg = "format=rdb"
        # Codes (convert to String if in wrong format)
        if isinstance(stat_cd, int):
            stat_cd = "%05"%stat_cd
        stat_cdArg= "statCd="+str(stat_cd)
        # Parameters
        parameterArgs = "parameterCd=00060"
        # Dates
        startDateArg = "startDT=" + startDT
        endDateArg = "endDT=" + endDT
        dateArg = "&".join([startDateArg,endDateArg])
        # REST Argument
        arg = "&".join([countyArg,formatArg,stat_cdArg,dateArg,parameterArgs])
        RESTrequest = self.dataPath + arg

        # Get data
        try:
            # Open the data url
            urlData = urllib2.urlopen(RESTrequest)
             # Create String buffer and parse the url
            csvDataBuf = parse_USGS_csv(urlData)
        
            # Define Date parser function
            def dateparser(dates):
                return [time.strptime(date,format='%Y-%m-%d') for date in dates]
                
            # Make a data frame
            DF = pd.read_table(StringIO.StringIO(csvDataBuf),
                            comment = '#',
                            header=None)
            DF.columns = ['Agency','Site','Date','Value','Q']
            DF['Value'] = DF[ 'Value'].astype('float')
            DF['Date'] = pd.to_datetime(DF['Date'])
            
            # Collapse site data
            data = DF[['Date','Value']].groupby('Date').sum()
            return data
        except:
            pass

def parse_USGS_csv(urlData):
    csvData = ''
    # Look for the header
    for t in urlData:
        m = re.search(r'^[#\da]', t)
        # Get non comment lines
        if (m == None):
            if csvData == '':
                csvData = t
            else:
                csvData = '\n'.join([csvData,t])
    return csvData
    
if __name__ == '__main__':
    
    waterData = USGSdata()
    path = '../data/'
    for county in waterData.countyData['USGS County Codes']:
        try:
            print county
            DF = waterData.getCountyStatisticsData(['01005'],
            stat_cd='00003',startDT='2000-07-01',endDT='2014-08-01')
            DF.to_json('../data/'+county+'.json',date_format='iso',
            orient = 'index', date_unit='s')
        except:
            print('Data Failed')
            pass
        