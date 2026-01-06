import { List } from './employees/list/list';
import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { d_List } from './departments/list/list';
import { Signup } from './auth/signup/signup';
import { VerifyEmail } from './auth/verify-email/verify-email';
import { Unverified } from './auth/unverified/unverified';
import { Panel } from './admin/panel/panel';
import { Setup } from './admin/CompanySetup/setup/setup';
import { Login } from './auth/login/login';
import { Branches } from './admin/CompanySetup/branches/branches';

export const routes: Routes = [

    {
        path: '', component: Login

    },

    {
        path: 'login', component: Login

    },

    {
        path: 'dashboard', component: List
    },
    {
        path:'dashboard', component: d_List
    },
    {
        path:'auth/signup', component: Signup
    },
    {
        path:'verify-email', component: VerifyEmail
    },

    {
        path:'unverified', component: Unverified
    },

    {
        path:'admin-panel', component: Panel
    },

    {
        path:'company-Setup', component: Setup
    },

    {
        path:'company-Setup', component: Setup
    },

    {
        path:'branches', component: Branches
    },





];
